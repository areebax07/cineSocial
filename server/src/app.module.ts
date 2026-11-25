import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { TitlesModule } from './titles/titles.module.js';
import { WatchlistModule } from './watchlist/watchlist.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { CommentsModule } from './comments/comments.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'server',
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    TitlesModule,
    WatchlistModule,
    RecommendationsModule,
    ReviewsModule,
    CommentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
