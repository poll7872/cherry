import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { LaTeXDocument } from 'src/latex/entities/latex-document.entity';

const MAIN_TEX_TEMPLATE = String.raw`\documentclass[journal]{IEEEtran}
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

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(LaTeXDocument)
    private readonly latexRepository: Repository<LaTeXDocument>,
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

    return savedProject;
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
    return this.projectRepository.remove(project);
  }
}
