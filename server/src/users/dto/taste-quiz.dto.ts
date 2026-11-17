import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsString } from 'class-validator';

export class TasteQuizDto {
  @ApiProperty({
    example: ['Sci-Fi', 'Thriller', 'Drama'],
    description: 'User favourite movie/TV genres',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  favouriteGenres: string[];

  @ApiProperty({
    example: ['Mind-bending', 'Dark & Gritty', 'Feel-good'],
    description: 'User preferred viewing moods',
  })
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  moodTags: string[];
}