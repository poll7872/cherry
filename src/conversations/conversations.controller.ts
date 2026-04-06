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
} from '@nestjs/common';
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
  sendMessage(
    @Param('id') id: string,
    @Body() dto: SendMessageDto,
    @GetUser() user: User,
  ) {
    return this.conversationsService.sendMessage(id, dto, user);
  }

  @Delete('conversations/:id')
  deleteConversation(@Param('id') id: string, @GetUser() user: User) {
    return this.conversationsService.deleteConversation(id, user);
  }
}
