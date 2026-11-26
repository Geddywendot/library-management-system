import { IsOptional, IsString } from 'class-validator';

export class CreateGenreDto {
  @IsString() name!: string;
  @IsOptional() @IsString() slug?: string;
}
