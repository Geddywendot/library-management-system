import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { GenresService } from './genres.service';

describe('GenresService', () => {
  let service: GenresService;
  let prisma: {
    genre: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(async () => {
    prisma = {
      genre: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a genre with generated slug', async () => {
      prisma.genre.findFirst.mockResolvedValue(null);
      prisma.genre.create.mockResolvedValue({
        id: 1,
        name: 'Sci Fi',
        slug: 'sci-fi',
      });

      const result = await service.create({ name: 'Sci Fi' });
      expect(result).toEqual({ id: 1, name: 'Sci Fi', slug: 'sci-fi' });
      expect(prisma.genre.create).toHaveBeenCalledWith({
        data: { name: 'Sci Fi', slug: 'sci-fi' },
      });
    });

    it('should throw ConflictException if genre already exists', async () => {
      prisma.genre.findFirst.mockResolvedValue({
        id: 1,
        name: 'Sci Fi',
        slug: 'sci-fi',
      });

      await expect(service.create({ name: 'Sci Fi' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all genres ordered by name', async () => {
      prisma.genre.findMany.mockResolvedValue([
        { id: 1, name: 'Fantasy', slug: 'fantasy' },
      ]);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(prisma.genre.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a genre by id', async () => {
      prisma.genre.findUnique.mockResolvedValue({
        id: 1,
        name: 'Fantasy',
        slug: 'fantasy',
        books: [],
      });

      const result = await service.findOne(1);
      expect(result).toEqual({
        id: 1,
        name: 'Fantasy',
        slug: 'fantasy',
        books: [],
      });
    });

    it('should throw NotFoundException if genre not found', async () => {
      prisma.genre.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a genre', async () => {
      prisma.genre.findUnique.mockResolvedValue({
        id: 1,
        name: 'Fantasy',
        slug: 'fantasy',
        books: [],
      });
      prisma.genre.update.mockResolvedValue({
        id: 1,
        name: 'High Fantasy',
        slug: 'high-fantasy',
      });

      const result = await service.update(1, { name: 'High Fantasy' });
      expect(result.name).toBe('High Fantasy');
    });
  });

  describe('remove', () => {
    it('should delete a genre', async () => {
      prisma.genre.findUnique.mockResolvedValue({
        id: 1,
        name: 'Fantasy',
        slug: 'fantasy',
        books: [],
      });
      prisma.genre.delete.mockResolvedValue({
        id: 1,
        name: 'Fantasy',
        slug: 'fantasy',
      });

      const result = await service.remove(1);
      expect(result.id).toBe(1);
    });
  });
});
