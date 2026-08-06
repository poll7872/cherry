import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaTeXDocument } from './entities/latex-document.entity';
import { CreateLatexDocumentDto } from './dto/create-latex-document.dto';
import { UpdateLatexDocumentDto } from './dto/update-latex-document.dto';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { DaytonaSandboxService } from 'src/ai-agent/daytona-sandbox.service';

const IEEE_JOURNAL_TEMPLATE = String.raw`\documentclass[journal]{IEEEtran}
\usepackage[spanish]{babel}
\usepackage[utf8]{inputenc}
\usepackage{graphicx}
\usepackage{amsmath}
\usepackage{cite}

\begin{document}
\title{Titulo del Paper}
\author{Autor, Member, IEEE}

\maketitle

\begin{abstract}
Resumen del documento.
\end{abstract}

\begin{IEEEkeywords}
palabras clave
\end{IEEEkeywords}

\section{Introduccion}
\label{intro}

\section{Trabajo Relacionado}
\label{related}

\section{Metodologia}
\label{method}

\section{Resultados}
\label{results}

\section{Conclusiones}
\label{conclusion}

\begin{thebibliography}{99}
\end{thebibliography}
\end{document}`;

const IEEE_CONFERENCE_TEMPLATE = String.raw`\documentclass[conference]{IEEEtran}
\usepackage[spanish]{babel}
\usepackage[utf8]{inputenc}
\usepackage{graphicx}

\begin{document}
\title{Titulo de la Presentacion}
\author{Autor Principal \and Co-Autor}

\maketitle

\begin{abstract}
Resumen corto del paper.
\end{abstract}

\section{Introduccion}
\label{intro}

\section{Estado del Arte}
\label{state}

\section{Propuesta}
\label{proposal}

\section{Experimentacion}
\label{experiments}

\section{Conclusiones}
\label{conclusions}

\begin{thebibliography}{99}
\end{thebibliography}
\end{document}`;

@Injectable()
export class LatexService {
  private readonly logger = new Logger(LatexService.name);

  constructor(
    @InjectRepository(LaTeXDocument)
    private readonly latexRepository: Repository<LaTeXDocument>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly daytonaSandboxService: DaytonaSandboxService,
  ) {}

  getTemplate(type: 'journal' | 'conference' = 'journal'): string {
    return type === 'conference'
      ? IEEE_CONFERENCE_TEMPLATE
      : IEEE_JOURNAL_TEMPLATE;
  }

  async create(projectId: string, dto: CreateLatexDocumentDto, user: User) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['user'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.user || project.user.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    const content = dto.content || this.getTemplate(dto.template || 'journal');

    const document = this.latexRepository.create({
      title: dto.title,
      content,
      projectId,
    });

    const saved = await this.latexRepository.save(document);
    this.syncToSandbox(projectId, saved.title, saved.content);
    return saved;
  }

  async findAllByProject(projectId: string, user: User) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['user'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.user || project.user.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return this.latexRepository.find({
      where: { projectId },
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, user: User) {
    const document = await this.latexRepository.findOne({
      where: { id },
      relations: ['project', 'project.user'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!document.project.user || document.project.user.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return document;
  }

  async update(id: string, dto: UpdateLatexDocumentDto, user: User) {
    const document = await this.findOne(id, user);

    const oldTitle = document.title;
    if (dto.title !== undefined) {
      document.title = dto.title;
    }
    if (dto.content !== undefined) {
      document.content = dto.content;
    }

    const saved = await this.latexRepository.save(document);

    // Keep the sandbox in sync (background, non-blocking)
    if (dto.content !== undefined) {
      this.syncToSandbox(saved.projectId, saved.title, saved.content);
    }
    if (dto.title !== undefined && dto.title !== oldTitle) {
      this.daytonaSandboxService
        .deleteFile(saved.projectId, oldTitle)
        .catch((err: unknown) =>
          this.logger.warn(
            `Could not remove old sandbox file ${oldTitle}: ${String(err)}`,
          ),
        );
    }

    return saved;
  }

  async remove(id: string, user: User) {
    const document = await this.findOne(id, user);
    const { projectId, title } = document;
    await this.latexRepository.remove(document);

    this.daytonaSandboxService
      .deleteFile(projectId, title)
      .catch((err: unknown) =>
        this.logger.warn(
          `Could not remove sandbox file ${title}: ${String(err)}`,
        ),
      );

    return { message: 'Document deleted' };
  }

  /**
   * Uploads a document to the sandbox in the background. Failures are logged
   * but never break the API response: the full sync before compile is the
   * correctness backstop.
   */
  private syncToSandbox(projectId: string, title: string, content: string) {
    this.daytonaSandboxService
      .writeFile(projectId, title, content)
      .catch((err: unknown) =>
        this.logger.warn(`Sandbox sync failed for ${title}: ${String(err)}`),
      );
  }
}
