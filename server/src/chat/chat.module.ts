import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service.js';
import { ChatController } from './chat.controller.js';
import { ChatGateway } from './chat.gateway.js';
import { TitlesModule } from '../titles/titles.module.js';

@Module({
  imports: [
    TitlesModule,
    // AuthModule doesn't export JwtService, so register it here with the SAME secret
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'cinesocial_super_secret_jwt_key_2026',
    }),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
  exports: [ChatService, ChatGateway],
})
export class ChatModule {}