import { Module } from '@nestjs/common';
import { SocialService } from './social.service.js';
import { SocialController } from './social.controller.js';

@Module({
  controllers: [SocialController],
  providers: [SocialService],
})
export class SocialModule {}