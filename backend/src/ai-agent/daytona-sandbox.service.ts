import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Daytona, Sandbox } from '@daytona/sdk';
import { Project } from 'src/projects/entities/project.entity';
import { LaTeXDocument } from 'src/latex/entities/latex-document.entity';

@Injectable()
export class DaytonaSandboxService implements OnModuleInit {
  private readonly logger = new Logger(DaytonaSandboxService.name);
  private daytona: Daytona;

  /** In-memory cache: projectId -> live Sandbox object */
  private runningSandboxes: Map<string, Sandbox> = new Map();

  /** In-flight sandbox creation promises to avoid creating two sandboxes concurrently */
  private creatingSandboxes: Map<string, Promise<Sandbox>> = new Map();

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(LaTeXDocument)
    private readonly latexRepository: Repository<LaTeXDocument>,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('DAYTONA_API_KEY');
    const apiUrl =
      this.configService.get<string>('DAYTONA_API_URL') ||
      'https://app.daytona.io/api';

    this.daytona = new Daytona({ apiKey: apiKey || '', apiUrl });
  }

  async getSandboxForProject(projectId: string): Promise<Sandbox> {
    // 1. In-memory cache hit — assert it is actually running before reusing it
    if (this.runningSandboxes.has(projectId)) {
      this.logger.debug(`Cache hit for project ${projectId}`);
      const cached = this.runningSandboxes.get(projectId)!;
      if (await this.ensureSandboxStarted(cached)) {
        return cached;
      }
      // Sandbox was auto-stopped/archived while cached — drop it and rebuild below
      this.logger.warn(
        `Cached sandbox for project ${projectId} is not running, resuming it.`,
      );
      this.runningSandboxes.delete(projectId);
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

        // >300s to also cover restoring an archived sandbox from object storage
        if (await this.ensureSandboxStarted(sandbox, 300)) {
          this.runningSandboxes.set(projectId, sandbox);
          return sandbox;
        }

        // Exists but cannot be started (error state, restore timeout, …) — recreate
        this.logger.warn(
          `Sandbox ${project.sandboxId} could not be resumed, deleting it and creating a new one.`,
        );
        try {
          await sandbox.delete();
        } catch (deleteErr) {
          this.logger.warn(
            `Could not delete unreachable sandbox ${project.sandboxId}: ${deleteErr}`,
          );
        }
      } catch (err) {
        // The sandbox no longer exists in Daytona (e.g. expired) — fall through to create a new one
        this.logger.warn(
          `Sandbox ${project.sandboxId} not found in Daytona, creating a new one. Error: ${err}`,
        );
      }
    }

    // 3. Create a fresh sandbox and persist its ID
    return this.createSandbox(projectId);
  }

  /**
   * Verifies a sandbox is actually running, starting it if it was stopped,
   * paused or archived. Returns false when the sandbox cannot be resumed so
   * the caller can fall back to creating a fresh one.
   */
  private async ensureSandboxStarted(
    sandbox: Sandbox,
    timeout: number = 180,
  ): Promise<boolean> {
    try {
      await sandbox.refreshData();
      if (sandbox.state !== 'started') {
        this.logger.log(
          `Starting sandbox ${sandbox.id} (state=${sandbox.state})…`,
        );
        await sandbox.start(timeout);
      }
      return true;
    } catch (error) {
      this.logger.warn(
        `Could not resume sandbox ${sandbox.id}: ${error instanceof Error ? error.message : error}`,
      );
      return false;
    }
  }

  /**
   * Creates a sandbox, deduplicating concurrent calls per project so we never
   * spin up two sandboxes for the same project at once.
   */
  private createSandbox(projectId: string): Promise<Sandbox> {
    if (this.creatingSandboxes.has(projectId)) {
      return this.creatingSandboxes.get(projectId)!;
    }

    const creation = this.doCreateSandbox(projectId).finally(() => {
      this.creatingSandboxes.delete(projectId);
    });
    this.creatingSandboxes.set(projectId, creation);
    return creation;
  }

  private async doCreateSandbox(projectId: string): Promise<Sandbox> {
    this.logger.log(`Creating new sandbox for project ${projectId}`);
    const sandbox = await this.daytona.create(
      {
        image: 'poll7872/arch-texlive:v3',
        autoStopInterval: 120, // 2h idle before auto-stop (default is 15 min)
        autoDeleteInterval: -1, // never auto-delete (keeps the project filesystem)
      },
      { timeout: 300 }, // cover building the snapshot from the texlive image
    );

    // Persist the sandbox ID so we never create a second one for this project
    await this.projectRepository.update(projectId, {
      sandboxId: sandbox.id,
    });

    this.runningSandboxes.set(projectId, sandbox);
    return sandbox;
  }

  /**
   * Resolves the sandbox for a project and runs an operation against it.
   * If the operation fails while the sandbox is still cached, the cache is
   * invalidated and the operation retried once against a freshly resolved
   * sandbox (which restarts or recreates it as needed).
   */
  private async withSandbox<T>(
    projectId: string,
    operation: (sandbox: Sandbox) => Promise<T>,
  ): Promise<T> {
    let sandbox = await this.getSandboxForProject(projectId);
    try {
      return await operation(sandbox);
    } catch (error) {
      if (this.runningSandboxes.has(projectId)) {
        this.logger.warn(
          `Sandbox operation failed for project ${projectId}, invalidating cache and retrying once: ${error instanceof Error ? error.message : error}`,
        );
        this.runningSandboxes.delete(projectId);
        sandbox = await this.getSandboxForProject(projectId);
        return await operation(sandbox);
      }
      throw error;
    }
  }

  async compileLatex(
    projectId: string,
    filename: string = 'main.tex',
  ): Promise<{ success: boolean; output: string; pdfBase64?: string }> {
    try {
      const result = await this.withSandbox(projectId, (sandbox) =>
        sandbox.process.executeCommand(
          `latexmk -pdf -interaction=nonstopmode ${filename}`,
        ),
      );

      const output = result.result || '';

      if (result.exitCode !== 0) {
        return { success: false, output };
      }

      const pdfFile = filename.replace('.tex', '.pdf');

      try {
        const pdfData = await this.withSandbox(projectId, (sandbox) =>
          sandbox.fs.downloadFile(pdfFile),
        );
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
      const result = await this.withSandbox(projectId, (sandbox) =>
        sandbox.process.executeCommand(code),
      );
      return { output: result.result || '', exitCode: result.exitCode };
    } catch (error) {
      return {
        output: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        exitCode: 1,
      };
    }
  }

  async readFile(projectId: string, path: string): Promise<string | null> {
    try {
      const buffer = await this.withSandbox(projectId, (sandbox) =>
        sandbox.fs.downloadFile(path),
      );
      return Buffer.from(buffer).toString('utf-8');
    } catch (error) {
      this.logger.warn(
        `File ${path} not found in sandbox for project ${projectId}: ${error}`,
      );
      return null;
    }
  }

  async writeFile(
    projectId: string,
    path: string,
    content: string,
  ): Promise<void> {
    try {
      await this.withSandbox(projectId, (sandbox) =>
        sandbox.fs.uploadFile(Buffer.from(content), path),
      );
    } catch (error) {
      this.logger.error(
        `Error writing file ${path} in sandbox for project ${projectId}: ${error}`,
      );
      throw error;
    }
  }

  async deleteFile(projectId: string, path: string): Promise<void> {
    try {
      await this.withSandbox(projectId, (sandbox) =>
        sandbox.fs.deleteFile(path),
      );
    } catch (error) {
      this.logger.warn(
        `Could not delete file ${path} in sandbox for project ${projectId}: ${error}`,
      );
    }
  }

  /**
   * Syncs the project's LaTeX documents (DB, source of truth) into the sandbox
   * so compilation and AI reads always reflect the latest saved content.
   * Removes sandbox .tex files that no longer exist in the DB (renames/deletes).
   */
  async syncProjectFiles(projectId: string): Promise<void> {
    const docs = await this.latexRepository.find({
      where: { projectId },
    });

    await this.withSandbox(projectId, (sandbox) =>
      this.syncSandboxFiles(sandbox, docs, projectId),
    );
  }

  private async syncSandboxFiles(
    sandbox: Sandbox,
    docs: LaTeXDocument[],
    projectId: string,
  ): Promise<void> {
    // 1. Upload every DB document
    for (const doc of docs) {
      const dirName = doc.title.includes('/')
        ? doc.title.substring(0, doc.title.lastIndexOf('/'))
        : null;
      if (dirName) {
        await sandbox.process.executeCommand(
          `mkdir -p ${this.shellQuote(dirName)}`,
        );
      }
      await sandbox.fs.uploadFile(Buffer.from(doc.content), doc.title);
    }

    // 2. Remove stale .tex files (renames/deletions)
    const validTitles = new Set(docs.map((d) => d.title));
    const filesInfo = await sandbox.fs.listFiles('.', { depth: 5 });
    for (const file of filesInfo) {
      if (!file.path) continue;
      const normalized = file.path.replace(/^\.\//, '');
      if (normalized.endsWith('.tex') && !validTitles.has(normalized)) {
        try {
          await sandbox.fs.deleteFile(normalized);
        } catch (err) {
          this.logger.warn(
            `Could not remove stale file ${normalized} from sandbox for project ${projectId}: ${err}`,
          );
        }
      }
    }
  }

  private shellQuote(path: string): string {
    return `'${path.replace(/'/g, `'\\''`)}'`;
  }

  /**
   * Stops the running sandbox to free CPU/RAM while keeping the filesystem.
   * Call this when the user closes the project workspace.
   *
   * Note: container sandboxes (like our texlive image) do not support the SDK's
   * pause()/resume() — the resume path is stop()/start(), which
   * getSandboxForProject already does via ensureSandboxStarted().
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

  async listFiles(projectId: string): Promise<string[]> {
    try {
      const filesInfo = await this.withSandbox(projectId, (sandbox) =>
        sandbox.fs.listFiles('.'),
      );
      return filesInfo
        .filter((f) => f.name.endsWith('.tex'))
        .map((f) => f.name);
    } catch (error) {
      this.logger.error(
        `Error listing files in sandbox for project ${projectId}: ${error}`,
      );
      return [];
    }
  }
}
