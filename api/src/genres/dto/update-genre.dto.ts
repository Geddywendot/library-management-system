import { IsOptional, IsString } from 'class-validator';

export class UpdateGenreDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() slug?: string;
}
