import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { LatexService } from './latex.service';
import { CreateLatexDocumentDto } from './dto/create-latex-document.dto';
import { UpdateLatexDocumentDto } from './dto/update-latex-document.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/get-user/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class LatexController {
  constructor(private readonly latexService: LatexService) {}

  @Post('projects/:projectId/documents')
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateLatexDocumentDto,
    @GetUser() user: User,
  ) {
    return this.latexService.create(projectId, dto, user);
  }

  @Get('projects/:projectId/documents')
  findAll(@Param('projectId') projectId: string, @GetUser() user: User) {
    return this.latexService.findAllByProject(projectId, user);
  }

  @Get('documents/:id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.latexService.findOne(id, user);
  }

  @Patch('documents/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLatexDocumentDto,
    @GetUser() user: User,
  ) {
    return this.latexService.update(id, dto, user);
  }

  @Delete('documents/:id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.latexService.remove(id, user);
  }
}
