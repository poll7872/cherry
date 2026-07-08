import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUser } from 'src/auth/get-user/get-user.decorator';
import { User } from 'src/users/entities/user.entity';

@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller()
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('projects/:projectId/conversations')
  createConversation(
    @Param('projectId') projectId: string,
    @Body() dto: CreateConversationDto,
    @GetUser() user: User,
  ) {
    return this.conversationsService.createConversation(projectId, dto, user);
  }

  @Get('projects/:projectId/conversations')
  getConversationsByProject(
    @Param('projectId') projectId: string,
    @GetUser() user: User,
  ) {
    return this.conversationsService.getConversationsByProject(projectId, user);
  }

  @Get('conversations/:id')
  getConversation(@Param('id') id: string, @GetUser() user: User) {
    return this.conversationsService.getConversation(id, user);
  }

  @Post('conversations/:id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @GetUser() user: User,
    @Res() res: Response,
  ) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Transfer-Encoding', 'chunked');

    try {
      const stream = this.conversationsService.sendMessageStream(id, dto, user);
      for await (const chunk of stream) {
        res.write(chunk);
      }
      res.end();
    } catch (e) {
      if (!res.headersSent) {
        res.status(500).send(e instanceof Error ? e.message : String(e));
      } else {
        res.end();
      }
    }
  }

  @Delete('conversations/:id')
  deleteConversation(@Param('id') id: string, @GetUser() user: User) {
    return this.conversationsService.deleteConversation(id, user);
  }
}
