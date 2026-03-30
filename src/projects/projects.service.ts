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

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User) {
    const project = this.projectRepository.create({
      ...createProjectDto,
      user,
    });

    return await this.projectRepository.save(project);
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
