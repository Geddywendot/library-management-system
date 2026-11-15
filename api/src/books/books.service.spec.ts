import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { BooksService } from './books.service';

describe('BooksService', () => {
  let service: BooksService;
  let prisma: {
    book: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      book: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should build where clause from genreId and search, and apply skip/take for pagination', async () => {
      prisma.book.findMany.mockResolvedValue([]);

      await service.findAll({
        genreId: 2,
        search: 'tolkien',
        page: 2,
        limit: 5,
      });

      expect(prisma.book.findMany).toHaveBeenCalledWith({
        where: {
          genreId: 2,
          OR: [
            { title: { contains: 'tolkien', mode: 'insensitive' } },
            { author: { contains: 'tolkien', mode: 'insensitive' } },
          ],
        },
        skip: 5,
        take: 5,
        include: { genre: true },
        orderBy: { title: 'asc' },
      });
    });

    it('should apply defaults when pagination parameters are omitted', async () => {
      prisma.book.findMany.mockResolvedValue([]);

      await service.findAll();

      expect(prisma.book.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 0,
        take: 10,
        include: { genre: true },
        orderBy: { title: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      prisma.book.findUnique.mockResolvedValue({ id: 1, title: 'Test Book' });
      const result = await service.findOne(1);
      expect(result).toEqual({ id: 1, title: 'Test Book' });
    });

    it('should throw NotFoundException if book not found', async () => {
      prisma.book.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a book with defaults', async () => {
      const dto = {
        title: 'New Book',
        author: 'Author Name',
        isbn: '1234567890',
        totalCopies: 3,
        genreId: 1,
      };
      prisma.book.create.mockResolvedValue({
        id: 1,
        ...dto,
        availableCopies: 3,
      });

      const result = await service.create(dto);
      expect(result.id).toBe(1);
      expect(prisma.book.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          availableCopies: 3,
          description: 'New Book by Author Name.',
          coverImage: undefined,
        },
        include: { genre: true },
      });
    });
  });

  describe('update', () => {
    it('should update a book', async () => {
      prisma.book.findUnique.mockResolvedValue({ id: 1, title: 'Old Title' });
      prisma.book.update.mockResolvedValue({ id: 1, title: 'New Title' });

      const result = await service.update(1, { title: 'New Title' });
      expect(result.title).toBe('New Title');
    });
  });

  describe('remove', () => {
    it('should delete a book', async () => {
      prisma.book.findUnique.mockResolvedValue({ id: 1, title: 'Book' });
      prisma.book.delete.mockResolvedValue({ id: 1, title: 'Book' });

      const result = await service.remove(1);
      expect(result.id).toBe(1);
    });
  });
});
