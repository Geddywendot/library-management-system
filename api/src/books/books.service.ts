import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  findAll(genreId?: string, search?: string, page = 1, limit = 20) {
    return this.prisma.book.findMany({
      where: {
        ...(genreId && { genreId: Number(genreId) }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { author: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: { genre: true },
      skip: (page - 1) * limit,
      take: Number(limit),
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({ where: { id }, include: { genre: true } });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  create(dto: CreateBookDto) {
    return this.prisma.book.create({
      data: { ...dto, availableCopies: dto.totalCopies },
    });
  }

  update(id: number, dto: UpdateBookDto) {
    return this.prisma.book.update({ where: { id }, data: dto });
  }

  remove(id: number) {
    return this.prisma.book.delete({ where: { id } });
  }
}
