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

  findOne(id: number | string) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numId)) {
      return null;
    }
    return this.prisma.book.findUnique({
      where: { id: numId },
      include: { genre: true },
    });
  }
}
