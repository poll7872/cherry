import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import {
  createDeepAgent,
  CompositeBackend,
  StateBackend,
  StoreBackend,
  BackendRuntime,
} from 'deepagents';
import { ChatGoogle } from '@langchain/google';
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

@Injectable()
export class AiAgentService implements OnModuleInit {
  private agent: ReturnType<typeof createDeepAgent>;
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

  private async initializeAgent() {
    const databaseUrl = this.configService.get<string>('DATABASE_URL') || '';

    this.checkpointer = PostgresSaver.fromConnString(databaseUrl);
    await this.checkpointer.setup();

    const readLatexDocument = tool(
      async ({ documentId }, config: ToolCallConfig) => {
        const conversationId = config?.configurable?.thread_id;
        let projectId: string | undefined = undefined;
        if (conversationId) {
          projectId = await this.getProjectIdFromConversation(conversationId);
        }

        if (!projectId) {
          return 'Error: conversationId is required to verify project access.';
        }

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

        if (!doc) return 'Document not found';
        return doc.content;
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
        const conversationId = config?.configurable?.thread_id;
        let projectId: string | undefined = undefined;
        if (conversationId) {
          projectId = await this.getProjectIdFromConversation(conversationId);
        }
        if (!projectId) {
          return 'Error: conversationId is required to verify project access.';
        }

        let doc = await this.latexRepository.findOne({
          where: { title: documentId, projectId },
        });

        if (!doc && this.isValidUUID(documentId)) {
          try {
            doc = await this.latexRepository.findOne({
              where: { id: documentId, projectId },
            });
          } catch {
            // Ignore UUID error
          }
        }

        if (!doc) {
          const newDoc = this.latexRepository.create({
            title: documentId,
            content: content,
            projectId,
          });
          await this.latexRepository.save(newDoc);
          return `Document "${documentId}" created successfully`;
        }

        doc.content = content;
        await this.latexRepository.save(doc);
        return `Document "${documentId}" updated successfully`;
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

    const listLatexDocuments = tool(
      async ({ projectId } = {}, config: ToolCallConfig) => {
        const conversationId = config?.configurable?.thread_id;
        let targetProjectId = projectId;

        if (!targetProjectId && conversationId) {
          targetProjectId =
            await this.getProjectIdFromConversation(conversationId);
        }

        if (!targetProjectId) {
          return 'Project ID or Conversation ID required';
        }

        const docs = await this.latexRepository.find({
          where: { projectId: targetProjectId },
        });
        if (docs.length === 0) return 'No documents found in this project';
        return (
          'Documents in project:\n\n' +
          docs.map((d) => `Title: ${d.title} (ID: ${d.id})`).join('\n')
        );
      },
      {
        name: 'list_latex_documents',
        description:
          'List all LaTeX documents in a project. Returns document titles and IDs.',
        schema: z.object({
          projectId: z.string().optional(),
        }),
      },
    );

    const compileLatex = tool(
      async ({ filename = 'main.tex' }, config: ToolCallConfig) => {
        const conversationId = config?.configurable?.thread_id;
        if (!conversationId) {
          return 'Error: Uninitialized thread or missing conversationId.';
        }

        const projectId =
          await this.getProjectIdFromConversation(conversationId);
        if (!projectId) {
          return 'Error: conversationId is required to verify project access.';
        }

        const docs = await this.latexRepository.find({
          where: { projectId },
        });

        if (docs.length === 0) {
          return 'No documents found in this project to compile.';
        }

        const result = await this.daytonaService.compileLatex(
          projectId,
          docs,
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
          filename: z.string().default('main.tex'),
        }),
      },
    );

    const systemPrompt = `Eres Cherry, un asistente de escritura científica especializado en ayudar a escribir papers académicos en formato IEEE.

Tu rol:
- Ayudas al usuario a estructurar, redactar y mejorar sus documentos LaTeX
- Debes ser profesional, claro y enfocarte en la calidad académica

Herramientas disponibles:
- read_latex_document: Lee el contenido de un documento por su título o ID
- write_latex_document: Escribe o modifica un documento. También crea nuevos documentos
- list_latex_documents: Lista todos los documentos del proyecto actual
- compile_latex: Compila un documento LaTeX a PDF

Identificadores de documentos:
- Usa el TÍTULO del documento como identificador (ej: "main.tex", "chapter1.tex", "abstract.tex")
- Los títulos de documentos tienen formato de nombre de archivo, NO son UUIDs

Flujo de trabajo recomendado:
1. Primero usa list_latex_documents para ver qué documentos existen
2. Para leer: usa read_latex_document con el título (ej: documentId: "main.tex")
3. Para escribir/sobreescribir/almacenar/crear: usa write_latex_document con el título y el contenido.
4. Para compilar: usa compile_latex con el filename (ej: "main.tex"). Se compilarán todos los documentos juntos automáticamente.`;

    const model = new ChatGoogle({
      apiKey: this.configService.get<string>('GOOGLE_API_KEY'),
      model: 'gemini-2.5-flash',
    });

    this.agent = createDeepAgent({
      model,
      tools: [
        readLatexDocument,
        writeLatexDocument,
        listLatexDocuments,
        compileLatex,
      ],
      systemPrompt,
      backend: (config: BackendRuntime) =>
        new CompositeBackend(new StateBackend(config), {
          '/memories/': new StoreBackend(config),
        }),
      checkpointer: this.checkpointer,
    });
  }

  async sendMessage(
    conversationId: string,
    userMessage: string,
    userId?: string,
  ): Promise<string> {
    const config = {
      configurable: {
        thread_id: conversationId,
        user_id: userId || 'default',
      },
    };

    try {
      const response = await this.agent.invoke(
        { messages: [{ role: 'user', content: userMessage }] },
        config,
      );

      const assistantMessage =
        response.messages?.[response.messages.length - 1]?.content;

      let textContent = '';
      if (typeof assistantMessage === 'string') {
        textContent = assistantMessage;
      } else if (Array.isArray(assistantMessage)) {
        textContent = (assistantMessage as Array<string | { text?: string }>)
          .map((block) =>
            typeof block === 'string' ? block : block.text || '',
          )
          .join('');
      }

      return textContent || 'No response';
    } catch (error) {
      console.error('Error invoking agent:', error);
      return 'Error processing message';
    }
  }
}
