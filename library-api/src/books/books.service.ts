import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BooksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.book.findMany({
      include: { genre: true },
      orderBy: { title: 'asc' },
    });
  }

  findOne(id: string) {
    return this.prisma.book.findUnique({
      where: { id },
      include: { genre: true },
    });
  }
}
