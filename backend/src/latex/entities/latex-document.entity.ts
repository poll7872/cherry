import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Project } from 'src/projects/entities/project.entity';

@Entity()
export class LaTeXDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', default: '' })
  content: string;

  @ManyToOne(() => Project, (project) => project.latexDocuments, {
    onDelete: 'CASCADE',
  })
  project: Project;

  @Column()
  projectId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
