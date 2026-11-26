import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString() title!: string;
  @IsString() author!: string;
  @IsString() isbn!: string;
  @IsString() description!: string;
  @IsOptional() @IsString() coverImage?: string;
  @IsInt() @Min(1) totalCopies!: number;
  @IsInt() genreId!: number;
}
