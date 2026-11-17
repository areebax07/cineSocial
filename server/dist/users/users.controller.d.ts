import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
import { TasteQuizDto } from './dto/taste-quiz.dto.js';
import { UpdatePrivacyDto } from './dto/update-privacy.dto.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMyProfile(req: any): Promise<{
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
    updateProfile(req: any, dto: UpdateProfileDto): Promise<{
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
    uploadAvatar(req: any, file: Express.Multer.File): Promise<{
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
    saveTasteQuiz(req: any, dto: TasteQuizDto): Promise<{
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
    updatePrivacy(req: any, dto: UpdatePrivacyDto): Promise<{
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
    searchUsers(q: string, req: any): Promise<{
        displayName: string;
        id: string;
        bio: string | null;
        avatarUrl: string | null;
        favouriteGenres: string[];
    }[]>;
    getPublicProfile(id: string, req: any): Promise<{
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
    deactivateAccount(req: any): Promise<{
        message: string;
    }>;
}
