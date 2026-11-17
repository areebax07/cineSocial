var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getMyProfile(userId) {
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
    async updateProfile(userId, dto) {
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
    async updateAvatarFile(userId, filePath) {
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { avatarUrl: filePath },
        });
        const { passwordHash, ...safeUser } = updated;
        return safeUser;
    }
    async saveTasteQuiz(userId, dto) {
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
    async updatePrivacy(userId, dto) {
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
    async searchUsers(query, currentUserId) {
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
    async getPublicProfile(targetUserId, currentUserId) {
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
    async deactivateAccount(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { status: 'deactivated' },
        });
        return { message: 'Account deactivated successfully' };
    }
};
UsersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PrismaService])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map