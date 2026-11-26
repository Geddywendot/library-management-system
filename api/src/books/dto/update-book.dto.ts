import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBookDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() author?: string;
  @IsOptional() @IsString() isbn?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() coverImage?: string;
  @IsOptional() @IsInt() @Min(1) totalCopies?: number;
  @IsOptional() @IsInt() genreId?: number;
}
