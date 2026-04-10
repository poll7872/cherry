import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAgentService } from './ai-agent.service';
import { DaytonaSandboxService } from './daytona-sandbox.service';
import { LaTeXDocument } from 'src/latex/entities/latex-document.entity';
import { Project } from 'src/projects/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LaTeXDocument, Project])],
  providers: [AiAgentService, DaytonaSandboxService],
  exports: [AiAgentService, DaytonaSandboxService],
})
export class AiAgentModule {}
