import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message, MessageRole } from './entities/message.entity';
import { Project } from 'src/projects/entities/project.entity';
import { User } from 'src/users/entities/user.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { AiAgentService } from 'src/ai-agent/ai-agent.service';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    private readonly aiAgentService: AiAgentService,
  ) {}

  async createConversation(
    projectId: string,
    dto: CreateConversationDto,
    user: User,
  ) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['user'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.user || project.user.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    const conversation = this.conversationRepository.create({
      title: dto.title || 'Nueva conversación',
      projectId,
    });

    return this.conversationRepository.save(conversation);
  }

  async getConversationsByProject(projectId: string, user: User) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['user'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.user || project.user.id !== user.id) {
      throw new ForbiddenException('Access denied');
    }

    return this.conversationRepository.find({
      where: { projectId },
      order: { updatedAt: 'DESC' },
    });
  }

  async getConversation(conversationId: string, user: User) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['project', 'project.user'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      !conversation.project.user ||
      conversation.project.user.id !== user.id
    ) {
      throw new ForbiddenException('Access denied');
    }

    const messages = await this.messageRepository.find({
      where: { conversationId },
      order: { timestamp: 'ASC' },
    });

    return {
      ...conversation,
      messages,
    };
  }

  async *sendMessageStream(
    conversationId: string,
    dto: SendMessageDto,
    user: User,
  ): AsyncGenerator<string, void, unknown> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['project', 'project.user'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      !conversation.project.user ||
      conversation.project.user.id !== user.id
    ) {
      throw new ForbiddenException('Access denied');
    }

    const userMessage = this.messageRepository.create({
      role: MessageRole.USER,
      content: dto.content,
      conversationId,
    });
    await this.messageRepository.save(userMessage);

    const stream = this.aiAgentService.sendMessageStream(
      conversationId,
      dto.content,
    );

    let assistantContent = '';

    for await (const chunk of stream) {
      assistantContent += chunk;
      yield chunk;
    }

    const assistantMessage = this.messageRepository.create({
      role: MessageRole.ASSISTANT,
      content: assistantContent,
      conversationId,
    });
    await this.messageRepository.save(assistantMessage);

    conversation.updatedAt = new Date();
    await this.conversationRepository.save(conversation);
  }

  async deleteConversation(conversationId: string, user: User) {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['project', 'project.user'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (
      !conversation.project.user ||
      conversation.project.user.id !== user.id
    ) {
      throw new ForbiddenException('Access denied');
    }

    await this.conversationRepository.remove(conversation);
    return { message: 'Conversation deleted' };
  }
}
