import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { TasteQuizDto } from './dto/taste-quiz.dto.js';
import { UpdatePrivacyDto } from './dto/update-privacy.dto.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getMyProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            reviews: true,
            watchlist: true,
          },
        },
      },
    });

    if (!user || user.status !== 'active') {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.displayName !== undefined && { displayName: dto.displayName }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
    });

    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  }

  async updateAvatarFile(userId: string, filePath: string) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl: filePath },
    });

    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  }

  async saveTasteQuiz(userId: string, dto: TasteQuizDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        favouriteGenres: dto.favouriteGenres,
        moodTags: dto.moodTags,
      },
    });

    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  }

  async updatePrivacy(userId: string, dto: UpdatePrivacyDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.profileVisibility !== undefined && {
          profileVisibility: dto.profileVisibility,
        }),
        ...(dto.whoCanCall !== undefined && { whoCanCall: dto.whoCanCall }),
      },
    });

    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  }

  async searchUsers(query: string, currentUserId: string) {
    const q = (query || '').trim();
    return this.prisma.user.findMany({
      where: {
        status: 'active',
        id: { not: currentUserId },
        ...(q
          ? {
              OR: [
                { displayName: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        favouriteGenres: true,
      },
      take: 20,
    });
  }

  async getPublicProfile(targetUserId: string, currentUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            reviews: true,
            watchlist: true,
          },
        },
      },
    });

    if (!user || user.status !== 'active') {
      throw new NotFoundException('User not found');
    }

    const followRecord = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });
    const isFollowing = Boolean(followRecord);

    // Enforce privacy settings when viewing another user's profile
    if (targetUserId !== currentUserId) {
      if (user.profileVisibility === 'private') {
        return {
          id: user.id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          profileVisibility: user.profileVisibility,
          isPrivate: true,
          isFollowing,
        };
      }

      if (user.profileVisibility === 'friends' && !isFollowing) {
        return {
          id: user.id,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          profileVisibility: user.profileVisibility,
          isPrivate: true,
          isFollowing: false,
        };
      }
    }

    const { passwordHash, email, ...publicUser } = user;
    return {
      ...publicUser,
      isPrivate: false,
      isFollowing,
    };
  }

  async deactivateAccount(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'deactivated' },
    });

    return { message: 'Account deactivated successfully' };
  }
}