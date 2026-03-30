import { Exclude } from 'class-transformer';
import { Project } from 'src/projects/entities/project.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Exclude()
  @Column()
  password: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  resetToken: string | null;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpires: Date | null;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Exclude()
  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken: string | null;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  emailVerificationExpires: Date | null;

  @OneToMany(() => Project, (project) => project.user)
  projects: Project[];
}
