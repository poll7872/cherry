import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Conversation } from 'src/conversations/entities/conversation.entity';
import { Message } from 'src/conversations/entities/message.entity';
import { LaTeXDocument } from 'src/latex/entities/latex-document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Conversation, Message, LaTeXDocument]),
    AuthModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
