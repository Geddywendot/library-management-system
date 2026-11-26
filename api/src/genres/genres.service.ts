import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.genre.findMany();
  }

  findOne(id: number) {
    return this.prisma.genre.findUnique({ where: { id } });
  }

  create(dto: CreateGenreDto) {
    const slug = dto.slug ?? dto.name.toLowerCase().replace(/\s+/g, '-');
    return this.prisma.genre.create({ data: { name: dto.name, slug } });
  }

  update(id: number, dto: UpdateGenreDto) {
    return this.prisma.genre.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.genre.delete({ where: { id } });
  }
}
