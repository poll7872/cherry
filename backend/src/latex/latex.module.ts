import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LatexService } from './latex.service';
import { LatexController } from './latex.controller';
import { LaTeXDocument } from './entities/latex-document.entity';
import { Project } from 'src/projects/entities/project.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([LaTeXDocument, Project]), AuthModule],
  controllers: [LatexController],
  providers: [LatexService],
  exports: [LatexService],
})
export class LatexModule {}
