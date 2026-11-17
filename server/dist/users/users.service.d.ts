import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { TasteQuizDto } from './dto/taste-quiz.dto.js';
import { UpdatePrivacyDto } from './dto/update-privacy.dto.js';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getMyProfile(userId: string): Promise<{
        _count: {
            watchlist: number;
            reviews: number;
            followers: number;
            following: number;
        };
        email: string;
        displayName: string;
        id: string;
        bio: string | null;
        avatarUrl: string | null;
        favouriteGenres: string[];
        moodTags: string[];
        profileVisibility: string;
        whoCanCall: string;
        status: string;
        createdAt: Date;
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        email: string;
        displayName: string;
        id: string;
        bio: string | null;
        avatarUrl: string | null;
        favouriteGenres: string[];
        moodTags: string[];
        profileVisibility: string;
        whoCanCall: string;
        status: string;
        createdAt: Date;
    }>;
    updateAvatarFile(userId: string, filePath: string): Promise<{
        email: string;
        displayName: string;
        id: string;
        bio: string | null;
        avatarUrl: string | null;
        favouriteGenres: string[];
        moodTags: string[];
        profileVisibility: string;
        whoCanCall: string;
        status: string;
        createdAt: Date;
    }>;
    saveTasteQuiz(userId: string, dto: TasteQuizDto): Promise<{
        email: string;
        displayName: string;
        id: string;
        bio: string | null;
        avatarUrl: string | null;
        favouriteGenres: string[];
        moodTags: string[];
        profileVisibility: string;
        whoCanCall: string;
        status: string;
        createdAt: Date;
    }>;
    updatePrivacy(userId: string, dto: UpdatePrivacyDto): Promise<{
        email: string;
        displayName: string;
        id: string;
        bio: string | null;
        avatarUrl: string | null;
        favouriteGenres: string[];
        moodTags: string[];
        profileVisibility: string;
        whoCanCall: string;
        status: string;
        createdAt: Date;
    }>;
    searchUsers(query: string, currentUserId: string): Promise<{
        displayName: string;
        id: string;
        bio: string | null;
        avatarUrl: string | null;
        favouriteGenres: string[];
    }[]>;
    getPublicProfile(targetUserId: string, currentUserId: string): Promise<{
        id: string;
        displayName: string;
        avatarUrl: string | null;
        profileVisibility: string;
        isPrivate: boolean;
        isFollowing: boolean;
    } | {
        isPrivate: boolean;
        isFollowing: boolean;
        _count: {
            watchlist: number;
            reviews: number;
            followers: number;
            following: number;
        };
        displayName: string;
        id: string;
        bio: string | null;
        avatarUrl: string | null;
        favouriteGenres: string[];
        moodTags: string[];
        profileVisibility: string;
        whoCanCall: string;
        status: string;
        createdAt: Date;
    }>;
    deactivateAccount(userId: string): Promise<{
        message: string;
    }>;
}
