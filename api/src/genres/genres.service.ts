import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createGenreDto: CreateGenreDto) {
    const slug =
      createGenreDto.slug ||
      createGenreDto.name
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w-]+/g, '');

    const existing = await this.prisma.genre.findFirst({
      where: {
        OR: [{ name: createGenreDto.name }, { slug }],
      },
    });

    if (existing) {
      throw new ConflictException(
        'Genre with this name or slug already exists',
      );
    }

    return this.prisma.genre.create({
      data: {
        name: createGenreDto.name,
        slug,
      },
    });
  }

  findAll() {
    return this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number | string) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numId)) {
      throw new NotFoundException(`Genre with id "${id}" not found`);
    }

    const genre = await this.prisma.genre.findUnique({
      where: { id: numId },
      include: { books: true },
    });

    if (!genre) {
      throw new NotFoundException(`Genre with id "${id}" not found`);
    }

    return genre;
  }

  async update(id: number | string, updateGenreDto: UpdateGenreDto) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numId)) {
      throw new NotFoundException(`Genre with id "${id}" not found`);
    }

    await this.findOne(numId);

    const data: { name?: string; slug?: string } = {};
    if (updateGenreDto.name) {
      data.name = updateGenreDto.name;
    }
    if (updateGenreDto.slug) {
      data.slug = updateGenreDto.slug;
    } else if (updateGenreDto.name) {
      data.slug = updateGenreDto.name
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^\w-]+/g, '');
    }

    return this.prisma.genre.update({
      where: { id: numId },
      data,
    });
  }

  async remove(id: number | string) {
    const numId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (isNaN(numId)) {
      throw new NotFoundException(`Genre with id "${id}" not found`);
    }

    await this.findOne(numId);

    return this.prisma.genre.delete({
      where: { id: numId },
    });
  }
}
