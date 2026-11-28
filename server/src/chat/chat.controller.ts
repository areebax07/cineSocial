import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ChatService } from './chat.service.js';
import { ChatGateway } from './chat.gateway.js';
import { CreateConversationDto } from './dto/create-conversation.dto.js';
import { AddParticipantsDto } from './dto/add-participants.dto.js';
import { UpdateMessageDto } from './dto/update-message.dto.js';
import { ListMessagesDto } from './dto/list-messages.dto.js';
import { PaginationQueryDto } from './dto/pagination-query.dto.js';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Post('conversations')
  @ApiOperation({
    summary: 'Create a direct or group conversation (an existing 1-on-1 is reused)',
  })
  async createConversation(@Req() req: any, @Body() dto: CreateConversationDto) {
    const { conversation, created } = await this.chatService.createConversation(
      req.user.id,
      dto,
    );
    if (created) {
      await this.chatGateway.notifyJoined(
        conversation.participants.map((p) => p.userId),
        conversation,
      );
    }
    return { ...conversation, created };
  }

  @Get('conversations')
  @ApiOperation({ summary: 'List my conversations with last message, newest activity first' })
  listConversations(@Req() req: any, @Query() dto: PaginationQueryDto) {
    return this.chatService.listConversations(req.user.id, dto);
  }

  @Post('conversations/:id/participants')
  @ApiOperation({ summary: 'Add people to a group conversation' })
  async addParticipants(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddParticipantsDto,
  ) {
    const { conversation, addedUserIds } = await this.chatService.addParticipants(
      req.user.id,
      id,
      dto.userIds,
    );
    await this.chatGateway.notifyJoined(addedUserIds, conversation);
    return conversation;
  }

  @Delete('conversations/:id/leave')
  @ApiOperation({ summary: 'Leave a group conversation' })
  async leave(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const result = await this.chatService.leaveConversation(req.user.id, id);
    this.chatGateway.notifyLeft(req.user.id, id);
    return result;
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Message history, newest first (cursor pagination via before)' })
  messages(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query() dto: ListMessagesDto,
  ) {
    return this.chatService.getMessages(req.user.id, id, dto);
  }

  @Patch('messages/:id')
  @ApiOperation({ summary: 'Edit your own message (broadcasts message:updated)' })
  async editMessage(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMessageDto,
  ) {
    const message = await this.chatService.editMessage(req.user.id, id, dto);
    this.chatGateway.emitToConversation(message.conversationId, 'message:updated', message);
    return message;
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete your own message (broadcasts message:deleted)' })
  async deleteMessage(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
    const { conversationId } = await this.chatService.deleteMessage(req.user.id, id);
    this.chatGateway.emitToConversation(conversationId, 'message:deleted', {
      id,
      conversationId,
    });
    return { message: 'Message deleted' };
  }
}