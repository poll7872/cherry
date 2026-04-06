import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LaTeXDocument } from './entities/latex-document.entity';
import { CreateLatexDocumentDto } from './dto/create-latex-document.dto';
import { UpdateLatexDocumentDto } from './dto/update-latex-document.dto';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';

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
  constructor(
    @InjectRepository(LaTeXDocument)
    private readonly latexRepository: Repository<LaTeXDocument>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
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

    return this.latexRepository.save(document);
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

    if (dto.title !== undefined) {
      document.title = dto.title;
    }
    if (dto.content !== undefined) {
      document.content = dto.content;
    }

    return this.latexRepository.save(document);
  }

  async remove(id: string, user: User) {
    const document = await this.findOne(id, user);
    await this.latexRepository.remove(document);
    return { message: 'Document deleted' };
  }
}
