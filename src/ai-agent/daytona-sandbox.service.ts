import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Daytona, Sandbox } from '@daytonaio/sdk';
import { LaTeXDocument } from 'src/latex/entities/latex-document.entity';
import { Project } from 'src/projects/entities/project.entity';

@Injectable()
export class DaytonaSandboxService implements OnModuleInit {
  private readonly logger = new Logger(DaytonaSandboxService.name);
  private daytona: Daytona;

  /** In-memory cache: projectId -> live Sandbox object */
  private runningSandboxes: Map<string, Sandbox> = new Map();

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('DAYTONA_API_KEY');
    const apiUrl =
      this.configService.get<string>('DAYTONA_API_URL') ||
      'https://app.daytona.io/api';

    this.daytona = new Daytona({ apiKey: apiKey || '', apiUrl });
  }

  async getSandboxForProject(projectId: string): Promise<Sandbox> {
    // 1. In-memory cache hit
    if (this.runningSandboxes.has(projectId)) {
      this.logger.debug(`Cache hit for project ${projectId}`);
      return this.runningSandboxes.get(projectId)!;
    }

    // 2. Check the DB for a previously persisted sandbox
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (project?.sandboxId) {
      this.logger.log(
        `Resuming existing sandbox ${project.sandboxId} for project ${projectId}`,
      );
      try {
        const sandbox = await this.daytona.get(project.sandboxId);

        // Wake it up if it was paused
        await sandbox.start();

        this.runningSandboxes.set(projectId, sandbox);
        return sandbox;
      } catch (err) {
        // The sandbox no longer exists in Daytona (e.g. expired) — fall through to create a new one
        this.logger.warn(
          `Sandbox ${project.sandboxId} not found in Daytona, creating a new one. Error: ${err}`,
        );
      }
    }

    // 3. Create a fresh sandbox and persist its ID
    this.logger.log(`Creating new sandbox for project ${projectId}`);
    const sandbox = await this.daytona.create({
      image: 'poll7872/arch-texlive:v2',
    });

    // Persist the sandbox ID so we never create a second one for this project
    await this.projectRepository.update(projectId, {
      sandboxId: sandbox.id,
    });

    this.runningSandboxes.set(projectId, sandbox);
    return sandbox;
  }

  async compileLatex(
    projectId: string,
    documents: LaTeXDocument[],
    filename: string = 'main.tex',
  ): Promise<{ success: boolean; output: string; pdfBase64?: string }> {
    try {
      const sandbox = await this.getSandboxForProject(projectId);

      const filesToUpload = documents.map((doc) => ({
        source: Buffer.from(doc.content),
        destination: doc.title,
      }));

      await sandbox.fs.uploadFiles(filesToUpload);

      const result = await sandbox.process.executeCommand(
        `latexmk -pdf -interaction=nonstopmode ${filename}`,
      );

      const output = result.result || '';

      if (result.exitCode !== 0) {
        return { success: false, output };
      }

      const pdfFile = filename.replace('.tex', '.pdf');

      try {
        const pdfData = await sandbox.fs.downloadFile(pdfFile);
        const pdfBase64 = Buffer.from(pdfData).toString('base64');
        return { success: true, output, pdfBase64 };
      } catch {
        return { success: false, output: 'PDF file was not generated' };
      }
    } catch (error) {
      return {
        success: false,
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async executeCode(
    projectId: string,
    code: string,
  ): Promise<{ output: string; exitCode: number }> {
    try {
      const sandbox = await this.getSandboxForProject(projectId);
      const result = await sandbox.process.executeCommand(code);
      return { output: result.result || '', exitCode: result.exitCode };
    } catch (error) {
      return {
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        exitCode: 1,
      };
    }
  }

  /**
   * Stops the running sandbox to free CPU/RAM while keeping the filesystem.
   * Call this when the user closes the project workspace.
   */
  async pauseSandbox(projectId: string): Promise<void> {
    const sandbox = this.runningSandboxes.get(projectId);
    if (sandbox) {
      try {
        this.logger.log(`Pausing sandbox for project ${projectId}`);
        await sandbox.stop();
      } catch (err) {
        this.logger.warn(`Could not stop sandbox: ${err}`);
      }
      this.runningSandboxes.delete(projectId);
    }
  }

  /**
   * Permanently deletes the sandbox from Daytona and clears the persisted ID.
   * Call this only when a project is being deleted.
   */
  async deleteSandbox(projectId: string): Promise<void> {
    // Try to delete from in-memory cache first
    const cached = this.runningSandboxes.get(projectId);
    if (cached) {
      try {
        await cached.delete();
      } catch (err) {
        this.logger.warn(`Could not delete cached sandbox: ${err}`);
      }
      this.runningSandboxes.delete(projectId);
      return;
    }

    // If not cached, look up the ID in DB and delete via API
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (project?.sandboxId) {
      try {
        const sandbox = await this.daytona.get(project.sandboxId);
        await sandbox.delete();
        this.logger.log(
          `Deleted sandbox ${project.sandboxId} for project ${projectId}`,
        );
      } catch (err) {
        this.logger.warn(
          `Sandbox ${project.sandboxId} could not be deleted (may already be gone): ${err}`,
        );
      }
    }
  }
}
