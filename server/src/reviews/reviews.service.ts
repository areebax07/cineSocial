import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TitlesService } from '../titles/titles.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { ListReviewsDto } from './dto/list-reviews.dto.js';

const reviewInclude = {
  user: { select: { id: true, displayName: true, avatarUrl: true } },
  title: {
    select: { id: true, tmdbId: true, type: true, name: true, posterUrl: true },
  },
  _count: { select: { likes: true, comments: true } },
};

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private titlesService: TitlesService,
  ) {}

  private async resolveTitleId(dto: CreateReviewDto): Promise<string> {
    if (dto.titleId) {
      const title = await this.prisma.title.findUnique({
        where: { id: dto.titleId },
        select: { id: true },
      });
      if (!title) throw new NotFoundException('Title not found');
      return title.id;
    }

    if (!dto.tmdbId || !dto.type) {
      throw new BadRequestException(
        'Provide either titleId OR both tmdbId and type ("movie" | "tv")',
      );
    }

    const existing = await this.prisma.title.findUnique({
      where: { tmdbId: dto.tmdbId },
      select: { id: true },
    });
    if (existing) return existing.id;

    const cached = await this.titlesService.getTitleDetailsAndCache(
      dto.type,
      dto.tmdbId,
    );
    return cached.id;
  }

  async create(userId: string, dto: CreateReviewDto) {
    const titleId = await this.resolveTitleId(dto);

    const existing = await this.prisma.review.findUnique({
      where: { userId_titleId: { userId, titleId } },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        'You have already reviewed this title. Update your existing review instead.',
      );
    }

    return this.prisma.review.create({
      data: { userId, titleId, rating: dto.rating, body: dto.body },
      include: reviewInclude,
    });
  }

  async findAll(dto: ListReviewsDto, viewerId: string) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const where = {
      ...(dto.titleId ? { titleId: dto.titleId } : {}),
      ...(dto.userId ? { userId: dto.userId } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.review.count({ where }),
      this.prisma.review.findMany({
        where,
        include: {
          ...reviewInclude,
          likes: { where: { userId: viewerId }, select: { userId: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      items: items.map(({ likes, ...review }) => ({
        ...review,
        likedByMe: likes.length > 0,
      })),
    };
  }

  async findOne(id: string, viewerId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        ...reviewInclude,
        likes: { where: { userId: viewerId }, select: { userId: true } },
      },
    });
    if (!review) throw new NotFoundException('Review not found');

    const { likes, ...rest } = review;
    return { ...rest, likedByMe: likes.length > 0 };
  }

  async update(userId: string, id: string, dto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own review');
    }

    return this.prisma.review.update({
      where: { id },
      data: {
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.body !== undefined && { body: dto.body }),
      },
      include: reviewInclude,
    });
  }

  async remove(userId: string, id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own review');
    }

    await this.prisma.review.delete({ where: { id } });
    return { message: 'Review deleted' };
  }

  // Atomic toggle: the delete-or-create runs inside one transaction, and the
  // composite PK on ReviewLike prevents duplicate likes under concurrency.
  async toggleLike(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      select: { id: true },
    });
    if (!review) throw new NotFoundException('Review not found');

    const liked = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.reviewLike.deleteMany({
        where: { userId, reviewId },
      });
      if (count > 0) return false;

      await tx.reviewLike.create({ data: { userId, reviewId } });
      return true;
    });

    const likeCount = await this.prisma.reviewLike.count({ where: { reviewId } });
    return { liked, likeCount };
  }
}