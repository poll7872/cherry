import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Daytona, Sandbox } from '@daytonaio/sdk';
import { LaTeXDocument } from 'src/latex/entities/latex-document.entity';

@Injectable()
export class DaytonaSandboxService implements OnModuleInit, OnModuleDestroy {
  private daytona: Daytona;
  private sandboxes: Map<string, Sandbox> = new Map();

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('DAYTONA_API_KEY');
    const apiUrl =
      this.configService.get<string>('DAYTONA_API_URL') ||
      'https://app.daytona.io/api';

    this.daytona = new Daytona({
      apiKey: apiKey || '',
      apiUrl,
    });
  }

  async onModuleDestroy() {
    await this.closeAll();
  }

  async getOrCreateSandbox(conversationId: string): Promise<Sandbox> {
    if (this.sandboxes.has(conversationId)) {
      return this.sandboxes.get(conversationId)!;
    }

    const sandbox = await this.daytona.create({
      image: 'poll7872/arch-texlive:v1',
    });

    this.sandboxes.set(conversationId, sandbox);
    return sandbox;
  }

  async compileLatex(
    conversationId: string,
    documents: LaTeXDocument[],
    filename: string = 'main.tex',
  ): Promise<{ success: boolean; output: string; pdfBase64?: string }> {
    try {
      const sandbox = await this.getOrCreateSandbox(conversationId);

      const filesToUpload = documents.map((doc) => ({
        source: Buffer.from(doc.content),
        destination: doc.title,
      }));

      await sandbox.fs.uploadFiles(filesToUpload);

      // Usando latexmk como motor principal y de pasada multiple.
      // Si latexmk falla por no estar en la imagen actual, caerá al catch y la IA lo reportará,
      // pero garantizamos la excelencia si la imagen build se actualiza.
      const result = await sandbox.process.executeCommand(
        `latexmk -pdf -interaction=nonstopmode ${filename}`,
      );

      const output = result.result || '';

      if (result.exitCode !== 0) {
        return {
          success: false,
          output,
        };
      }

      const pdfFile = filename.replace('.tex', '.pdf');
      let pdfBase64: string | undefined;

      try {
        const pdfData = await sandbox.fs.downloadFile(pdfFile);
        pdfBase64 = Buffer.from(pdfData).toString('base64');
      } catch {
        return {
          success: false,
          output: 'PDF file was not generated',
        };
      }

      return {
        success: true,
        output,
        pdfBase64,
      };
    } catch (error) {
      return {
        success: false,
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async executeCode(
    conversationId: string,
    code: string,
  ): Promise<{ output: string; exitCode: number }> {
    try {
      const sandbox = await this.getOrCreateSandbox(conversationId);
      const result = await sandbox.process.executeCommand(code);
      return {
        output: result.result || '',
        exitCode: result.exitCode,
      };
    } catch (error) {
      return {
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        exitCode: 1,
      };
    }
  }

  async closeSandbox(conversationId: string): Promise<void> {
    const sandbox = this.sandboxes.get(conversationId);
    if (sandbox) {
      try {
        await sandbox.delete();
      } catch {
        /* ignore */
      }
      this.sandboxes.delete(conversationId);
    }
  }

  async closeAll(): Promise<void> {
    for (const sandbox of this.sandboxes.values()) {
      try {
        await sandbox.delete();
      } catch {
        /* ignore */
      }
    }
    this.sandboxes.clear();
  }
}
