import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { LaTeXDocument } from 'src/latex/entities/latex-document.entity';
import { DaytonaSandboxService } from 'src/ai-agent/daytona-sandbox.service';
import { readFileSync } from 'fs';
import { join } from 'path';

function getMainTexTemplate(): string {
  return readFileSync(join(__dirname, 'templates', 'main.tex'), 'utf-8');
}

const MAIN_TEX_TEMPLATE = getMainTexTemplate();

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(LaTeXDocument)
    private readonly latexRepository: Repository<LaTeXDocument>,
    private readonly daytonaSandboxService: DaytonaSandboxService,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User) {
    const project = this.projectRepository.create({
      ...createProjectDto,
      user,
    });

    const savedProject = await this.projectRepository.save(project);

    const mainDoc = this.latexRepository.create({
      title: 'main.tex',
      content: MAIN_TEX_TEMPLATE,
      projectId: savedProject.id,
    });
    await this.latexRepository.save(mainDoc);

    // Initialize sandbox and compile in background
    this.initializeSandboxBackground(savedProject.id).catch((err: unknown) => {
      this.logger.error(
        `Failed to trigger background sandbox initialization for project ${savedProject.id}`,
        err instanceof Error ? err.stack : String(err),
      );
    });

    return savedProject;
  }

  private async initializeSandboxBackground(projectId: string) {
    try {
      this.logger.log(
        `Starting background sandbox initialization for project ${projectId}`,
      );
      // 1. Write the main.tex template to the sandbox (this will also create the sandbox if needed via daytonaSandboxService)
      await this.daytonaSandboxService.writeFile(
        projectId,
        'main.tex',
        MAIN_TEX_TEMPLATE,
      );

      // 2. Compile LaTeX
      this.logger.log(
        `Compiling LaTeX template for project ${projectId} in sandbox`,
      );
      const result = await this.daytonaSandboxService.compileLatex(projectId);

      // 3. Save the compiled PDF back to the project if successful
      if (result.success && result.pdfBase64) {
        await this.projectRepository.update(projectId, {
          compiledPdfBase64: result.pdfBase64,
        });
        this.logger.log(
          `Successfully compiled and saved initial PDF for project ${projectId}`,
        );
      } else {
        this.logger.warn(
          `Background compilation for project ${projectId} failed. Output: ${result.output}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error during background sandbox initialization for project ${projectId}:`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  async findAll(user: User) {
    return this.projectRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const project = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.user', 'user')
      .where('project.id = :id', { id })
      .getOne();

    if (!project) throw new NotFoundException('Project not found.');
    if (!project.user || project.user.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return project;
  }

  async getCompiledPdf(id: string, user: User): Promise<Buffer> {
    const project = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.user', 'user')
      .addSelect('project.compiledPdfBase64')
      .where('project.id = :id', { id })
      .getOne();

    if (!project) throw new NotFoundException('Project not found.');
    if (!project.user || project.user.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    if (!project.compiledPdfBase64) {
      throw new NotFoundException('No compiled PDF found for this project.');
    }

    return Buffer.from(project.compiledPdfBase64, 'base64');
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: User) {
    const project = await this.findOne(id, user);
    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  async remove(id: string, user: User) {
    const project = await this.findOne(id, user);
    // Delete the Daytona sandbox if it exists
    await this.daytonaSandboxService.deleteSandbox(project.id);
    return this.projectRepository.remove(project);
  }
}
