import { User } from 'src/users/entities/user.entity';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { LaTeXDocument } from 'src/latex/entities/latex-document.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true, select: false })
  compiledPdfBase64: string;

  @Column({ nullable: true })
  sandboxId: string;

  @ManyToOne(() => User, (user) => user.projects, {
    onDelete: 'CASCADE',
    eager: false,
  })
  user: User;

  @OneToMany(() => Conversation, (conversation) => conversation.project)
  conversations: Conversation[];

  @OneToMany(() => LaTeXDocument, (doc) => doc.project)
  latexDocuments: LaTeXDocument[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
