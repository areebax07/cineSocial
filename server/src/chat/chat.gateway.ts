import { HttpException, Logger, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service.js';
import { SendMessageDto } from './dto/send-message.dto.js';

const roomOf = (conversationId: string) => `conversation:${conversationId}`;
const userRoom = (userId: string) => `user:${userId}`;

@WebSocketGateway({ cors: { origin: true } })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  // Global pipes from main.ts don't apply to gateways, so validate manually
  private readonly validator = new ValidationPipe({ whitelist: true, transform: true });

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
  ) {}

  // Client connects with: io(url, { auth: { token } })
  async handleConnection(client: Socket) {
    try {
      const header = client.handshake.headers.authorization;
      const token =
        (client.handshake.auth?.token as string | undefined) ??
        (header?.startsWith('Bearer ') ? header.slice(7) : undefined);
      if (!token) throw new Error('Missing token');

      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const userId = await this.chatService.validateUser(payload.sub);
      if (!userId) throw new Error('Inactive or unknown user');

      client.data.userId = userId;
      await client.join(userRoom(userId));

      const conversationIds = await this.chatService.getConversationIds(userId);
      if (conversationIds.length > 0) {
        await client.join(conversationIds.map(roomOf));
      }
      client.emit('ready', { userId });
    } catch {
      client.emit('auth:error', { message: 'Unauthorized' });
      client.disconnect(true);
    }
  }

  // Client: socket.emit('message:send', {...}, (res) => ...)
  // Ack: { ok: true, message } | { ok: false, error }
  @SubscribeMessage('message:send')
  async onSend(@ConnectedSocket() client: Socket, @MessageBody() payload: unknown) {
    try {
      const userId = client.data.userId as string | undefined;
      if (!userId) return { ok: false, error: 'Not authenticated' };

      const dto = (await this.validator.transform(payload, {
        type: 'body',
        metatype: SendMessageDto,
      })) as SendMessageDto;

      const message = await this.chatService.sendMessage(userId, dto);
      this.server.to(roomOf(dto.conversationId)).emit('message:new', message);
      return { ok: true, message };
    } catch (e) {
      return this.fail(e);
    }
  }

  private fail(e: unknown) {
    if (e instanceof HttpException) {
      const res = e.getResponse() as any;
      const msg = typeof res === 'string' ? res : (res?.message ?? e.message);
      return { ok: false, error: Array.isArray(msg) ? msg.join(', ') : msg };
    }
    this.logger.error(e);
    return { ok: false, error: 'Internal server error' };
  }

  // ----- helpers called by ChatController after REST changes -----

  /** Put users' live sockets into the room and tell them about the conversation. */
  async notifyJoined(userIds: string[], conversation: { id: string }) {
    for (const id of userIds) {
      this.server.in(userRoom(id)).socketsJoin(roomOf(conversation.id));
      this.server.to(userRoom(id)).emit('conversation:new', conversation);
    }
  }

  notifyLeft(userId: string, conversationId: string) {
    this.server.in(userRoom(userId)).socketsLeave(roomOf(conversationId));
    this.server
      .to(roomOf(conversationId))
      .emit('conversation:participant-left', { conversationId, userId });
  }

  emitToConversation(conversationId: string, event: string, payload: unknown) {
    this.server.to(roomOf(conversationId)).emit(event, payload);
  }
}