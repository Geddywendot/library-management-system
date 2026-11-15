import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

export interface FindAllBooksQuery {
  genreId?: number;
  search?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query?: FindAllBooksQuery) {
    const where: Prisma.BookWhereInput = {};

    if (query?.genreId !== undefined && !isNaN(query.genreId)) {
      where.genreId = query.genreId;
    }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { author: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const page = query?.page && query.page > 0 ? query.page : 1;
    const limit = query?.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;
    const take = limit;

    return this.prisma.book.findMany({
      where,
      skip,
      take,
      include: { genre: true },
      orderBy: { title: 'asc' },
    });
  }

  async findOne(id: number | string) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numId)) {
      throw new NotFoundException(`Book with id "${id}" not found`);
    }

    const book = await this.prisma.book.findUnique({
      where: { id: numId },
      include: { genre: true },
    });

    if (!book) {
      throw new NotFoundException(`Book with id "${id}" not found`);
    }

    return book;
  }

  async create(createBookDto: CreateBookDto) {
    const totalCopies = createBookDto.totalCopies ?? 1;
    const availableCopies = createBookDto.availableCopies ?? totalCopies;
    const description =
      createBookDto.description ??
      `${createBookDto.title} by ${createBookDto.author}.`;

    return this.prisma.book.create({
      data: {
        title: createBookDto.title,
        author: createBookDto.author,
        isbn: createBookDto.isbn,
        description,
        coverImage: createBookDto.coverImage,
        totalCopies,
        availableCopies,
        genreId: createBookDto.genreId,
      },
      include: { genre: true },
    });
  }

  async update(id: number | string, updateBookDto: UpdateBookDto) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numId)) {
      throw new NotFoundException(`Book with id "${id}" not found`);
    }

    await this.findOne(numId);

    return this.prisma.book.update({
      where: { id: numId },
      data: updateBookDto,
      include: { genre: true },
    });
  }

  async remove(id: number | string) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numId)) {
      throw new NotFoundException(`Book with id "${id}" not found`);
    }

    await this.findOne(numId);

    return this.prisma.book.delete({
      where: { id: numId },
    });
  }
}
