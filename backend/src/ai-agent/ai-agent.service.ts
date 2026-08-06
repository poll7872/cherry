import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { createAgent, createMiddleware, type ReactAgent } from 'langchain';
//import { ChatGoogle } from '@langchain/google';
import { ChatOpenRouter } from '@langchain/openrouter';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaTeXDocument } from 'src/latex/entities/latex-document.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { DaytonaSandboxService } from './daytona-sandbox.service';

interface ToolCallConfig {
  configurable?: {
    thread_id?: string;
    [key: string]: unknown;
  };
}

type StreamChunk = {
  content?: string | Array<{ type?: string; text?: string }>;
  tool_call_id?: string;
};

const MAX_HISTORY_MESSAGES = 30;

@Injectable()
export class AiAgentService implements OnModuleInit {
  private agent: ReactAgent;
  private checkpointer: PostgresSaver;

  constructor(
    @InjectRepository(LaTeXDocument)
    private readonly latexRepository: Repository<LaTeXDocument>,
    private readonly configService: ConfigService,
    private readonly daytonaService: DaytonaSandboxService,
  ) {}

  async onModuleInit() {
    await this.initializeAgent();
  }

  private isValidUUID(str: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  private async getProjectIdFromConversation(
    conversationId: string,
  ): Promise<string | undefined> {
    try {
      const conversationRepo =
        this.latexRepository.manager.getRepository(Conversation);
      const conversation = await conversationRepo.findOne({
        where: { id: conversationId },
        relations: ['project'],
      });
      return conversation?.projectId || undefined;
    } catch {
      return undefined;
    }
  }

  private async resolveProjectId(
    config?: ToolCallConfig,
  ): Promise<string | undefined> {
    const conversationId = config?.configurable?.thread_id;
    if (!conversationId) return undefined;
    return this.getProjectIdFromConversation(conversationId);
  }

  private async findDocument(
    projectId: string,
    documentId: string,
  ): Promise<LaTeXDocument | null> {
    let doc = await this.latexRepository.findOne({
      where: { title: documentId, projectId },
    });

    if (!doc && this.isValidUUID(documentId)) {
      try {
        doc = await this.latexRepository.findOne({
          where: { id: documentId, projectId },
        });
      } catch {
        // Ignore UUID error, continue to not found
      }
    }

    return doc ?? null;
  }

  private async initializeAgent() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL') || '';

    this.checkpointer = PostgresSaver.fromConnString(databaseUrl);
    await this.checkpointer.setup();

    const readLatexDocument = tool(
      async ({ documentId }, config: ToolCallConfig) => {
        const projectId = await this.resolveProjectId(config);

        if (!projectId) {
          return 'Error: conversationId is required to verify project access.';
        }

        // Read from the database (source of truth) first
        const doc = await this.findDocument(projectId, documentId);
        if (doc) return doc.content;

        // Fallback to Sandbox
        const sandboxContent = await this.daytonaService.readFile(
          projectId,
          documentId,
        );
        if (sandboxContent !== null) {
          return sandboxContent;
        }

        return `Error: Document "${documentId}" not found. Use list_latex_documents to see the available documents.`;
      },
      {
        name: 'read_latex_document',
        description:
          'Read the content of a LaTeX document by its title or ID. Returns the LaTeX code. Use the document title like "main.tex" or "chapter1.tex".',
        schema: z.object({
          documentId: z.string(),
        }),
      },
    );

    const writeLatexDocument = tool(
      async ({ documentId, content }, config: ToolCallConfig) => {
        const projectId = await this.resolveProjectId(config);
        if (!projectId) {
          return 'Error: conversationId is required to verify project access.';
        }

        // Write directly to Sandbox
        await this.daytonaService.writeFile(projectId, documentId, content);

        // Keep DB in sync for the frontend
        const doc = await this.findDocument(projectId, documentId);

        if (!doc) {
          const newDoc = this.latexRepository.create({
            title: documentId,
            content: content,
            projectId,
          });
          await this.latexRepository.save(newDoc);
          return `Document "${documentId}" created successfully in Sandbox and DB`;
        }

        doc.content = content;
        await this.latexRepository.save(doc);
        return `Document "${documentId}" updated successfully in Sandbox and DB`;
      },
      {
        name: 'write_latex_document',
        description:
          'Write or update the content of a LaTeX document. Creates a new document if it does not exist. Use the document title like "main.tex" or "efecto_fotoelectrico.tex".',
        schema: z.object({
          documentId: z.string(),
          content: z.string(),
        }),
      },
    );

    const editLatexDocument = tool(
      async (
        { documentId, oldText, newText, replaceAll = false },
        config: ToolCallConfig,
      ) => {
        const projectId = await this.resolveProjectId(config);
        if (!projectId) {
          return 'Error: conversationId is required to verify project access.';
        }

        const doc = await this.findDocument(projectId, documentId);
        if (!doc) {
          return `Error: Document "${documentId}" not found. Use list_latex_documents to see the available documents.`;
        }

        const occurrences = doc.content.split(oldText).length - 1;
        if (occurrences === 0) {
          return `Error: The text to replace was not found in "${documentId}". Read the document with read_latex_document to see the current content.`;
        }

        if (occurrences > 1 && !replaceAll) {
          return `Error: The text was found ${occurrences} times in "${documentId}". Set replaceAll=true to replace all occurrences, or include more surrounding context in oldText to make it unique.`;
        }

        const updatedContent = replaceAll
          ? doc.content.split(oldText).join(newText)
          : doc.content.replace(oldText, newText);

        doc.content = updatedContent;
        await this.latexRepository.save(doc);
        await this.daytonaService.writeFile(
          projectId,
          documentId,
          updatedContent,
        );

        return `Edited "${documentId}" successfully (${occurrences} occurrence${
          occurrences > 1 ? 's' : ''
        } replaced). The document was updated in the database and synced to the sandbox.`;
      },
      {
        name: 'edit_latex_document',
        description:
          'Search and replace text inside an existing LaTeX document. Ideal for making targeted changes (e.g. rewriting an abstract) without sending the whole file. Use the document title like "main.tex".',
        schema: z.object({
          documentId: z.string(),
          oldText: z
            .string()
            .describe('The exact text to search for inside the document'),
          newText: z
            .string()
            .describe('The replacement text that will replace oldText'),
          replaceAll: z
            .boolean()
            .optional()
            .describe(
              'Set to true when oldText appears multiple times and all occurrences should be replaced. Defaults to false.',
            ),
        }),
      },
    );

    const listLatexDocuments = tool(
      async ({ projectId } = {}, config: ToolCallConfig) => {
        let targetProjectId = projectId;
        if (!targetProjectId) {
          targetProjectId = await this.resolveProjectId(config);
        }

        if (!targetProjectId) {
          return 'Project ID or Conversation ID required';
        }

        // List files from Sandbox
        const sandboxFiles =
          await this.daytonaService.listFiles(targetProjectId);
        if (sandboxFiles.length > 0) {
          return 'Documents in sandbox:\n\n' + sandboxFiles.join('\n');
        }

        // Fallback to DB
        const docs = await this.latexRepository.find({
          where: { projectId: targetProjectId },
        });
        if (docs.length === 0) return 'No documents found in this project';
        return (
          'Documents in project database (sandbox may be empty):\n\n' +
          docs.map((d) => `Title: ${d.title} (ID: ${d.id})`).join('\n')
        );
      },
      {
        name: 'list_latex_documents',
        description:
          'List all LaTeX documents in the current project sandbox. Returns document titles.',
        schema: z.object({
          projectId: z.string().optional(),
        }),
      },
    );

    const compileLatex = tool(
      async ({ filename = 'main.tex' }, config: ToolCallConfig) => {
        const projectId = await this.resolveProjectId(config);
        if (!projectId) {
          return 'Error: conversationId is required to verify project access.';
        }

        // Make sure the sandbox reflects the latest saved documents before compiling
        await this.daytonaService.syncProjectFiles(projectId);

        const result = await this.daytonaService.compileLatex(
          projectId,
          filename,
        );

        if (result.success && result.pdfBase64) {
          const projectRepo =
            this.latexRepository.manager.getRepository('Project');
          const project = await projectRepo.findOne({
            where: { id: projectId },
          });
          if (project) {
            project.compiledPdfBase64 = result.pdfBase64;
            await projectRepo.save(project);
          }
          return `PDF compiled successfully! Base64 length: ${result.pdfBase64.length} characters. The PDF is saved in the database and ready for the user to view.`;
        }
        return `Compilation failed:\n${result.output}`;
      },
      {
        name: 'compile_latex',
        description:
          'Compile the entire LaTeX project to PDF using Daytona sandbox. All files in the project are automatically included. Specify the entry point filename (e.g. "main.tex").',
        schema: z.object({
          filename: z
            .string()
            .optional()
            .describe('The main LaTeX file to compile, usually main.tex'),
        }),
      },
    );

    const systemPrompt = `Eres Cherry, un asistente experto en escritura científica y LaTeX, especializado en papers académicos de alta calidad (estilo IEEE).

Tu objetivo:
- Ayudar al usuario a escribir, estructurar y mejorar papers académicos.
- Priorizar claridad, rigor académico y buenas prácticas en LaTeX.

Comportamiento general:
- Usa un tono formal, preciso y académico.
- Sugiere mejoras estructurales y de contenido cuando sea necesario.
- Adapta la complejidad según el tipo de documento (paper corto, tesis, informe).

Estructura académica:
- Organiza el contenido siguiendo estándares académicos:
  Abstract, Introduction, Related Work, Methodology, Results, Discussion, Conclusion, References.
- Sugiere secciones si el usuario no las define.

Reglas de LaTeX:
1. Archivo principal:
   - Crea un archivo 'main.tex' solo si el proyecto lo requiere o no existe.
   - Usa el formato IEEE cuando sea apropiado.

2. Modularización (INTELIGENTE):
   - Usa modularización SOLO si el documento es largo o complejo.
   - Para documentos cortos, escribe todo en 'main.tex'.
   - Si modularizas, usa archivos como 'introduction.tex', 'methods.tex', etc.

3. Organización de archivos:
   - Puedes usar subcarpetas si mejora la claridad (ej: sections/, figures/).
   - Mantén consistencia en nombres.

4. Inclusión:
   - Usa \\input{} o \\include{} correctamente desde 'main.tex'.

Herramientas disponibles (usa SOLO estas, no inventes otras):
- list_latex_documents: lista los documentos del proyecto.
- read_latex_document: lee el contenido completo de un documento.
- write_latex_document: escribe o reemplaza el contenido completo de un documento.
- edit_latex_document: hace un cambio puntual (buscar y reemplazar) dentro de un documento.
- compile_latex: compila el proyecto a PDF en el sandbox.

Flujo de trabajo recomendado:
1. Analiza el estado del proyecto con 'list_latex_documents'.
2. Lee el documento relevante con 'read_latex_document' antes de modificarlo.
3. Para cambios puntuales usa 'edit_latex_document' (más eficiente y seguro que reescribir el archivo completo).
4. Usa 'write_latex_document' para crear documentos nuevos o reemplazar contenido completo.
5. Tras hacer cambios importantes, compila con 'compile_latex' para verificar que todo funciona.
`;

    /*const model = new ChatGoogle({
      apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
      model: 'gemini-2.5-flash',
    });*/

    const model = new ChatOpenRouter({
      model: 'google/gemini-2.5-flash-lite',
      apiKey: this.configService.get<string>('OPENROUTER_API_KEY'),
      // other params...
    });

    const trimHistoryMiddleware = createMiddleware({
      name: 'trim_history',
      wrapModelCall: async (request, handler) => {
        if (request.messages.length > MAX_HISTORY_MESSAGES) {
          return handler({
            ...request,
            messages: request.messages.slice(-MAX_HISTORY_MESSAGES),
          });
        }
        return handler(request);
      },
    });

    this.agent = createAgent({
      model,
      tools: [
        readLatexDocument,
        writeLatexDocument,
        editLatexDocument,
        listLatexDocuments,
        compileLatex,
      ],
      systemPrompt,
      checkpointer: this.checkpointer,
      middleware: [trimHistoryMiddleware],
    });
  }

  async *sendMessageStream(
    conversationId: string,
    userMessage: string,
    userId?: string,
  ): AsyncGenerator<string, void, unknown> {
    const config = {
      configurable: {
        thread_id: conversationId,
        user_id: userId || 'default',
      },
    };

    try {
      const stream = await this.agent.stream(
        {
          messages: [{ role: 'user', content: userMessage }],
        },
        {
          ...config,
          streamMode: 'messages',
        },
      );

      for await (const item of stream as AsyncIterable<unknown[]>) {
        const message = item?.[0] as StreamChunk | undefined;

        if (!message) continue;
        // Skip tool result messages and empty chunks (e.g. tool call only)
        if (message.tool_call_id || typeof message.content !== 'string')
          continue;
        if (!message.content) continue;

        yield message.content;
      }
    } catch (error) {
      console.error('Error invoking agent stream:', error);
      yield 'Error processing message';
    }
  }
}
