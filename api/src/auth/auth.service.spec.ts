import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };
  let jwtService: {
    sign: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock_jwt_token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should hash password with bcrypt and save user', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(
        ({ data }: { data: { email: string; password: string; role: Role } }) =>
          Promise.resolve({ id: 1, ...data }),
      );

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('mock_jwt_token');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.role).toBe(Role.PATRON);

      expect(prisma.user.create).toHaveBeenCalled();
      const calls = prisma.user.create.mock.calls as Array<
        [{ data: { password: string } }]
      >;
      const createArgs = calls[0][0];
      expect(createArgs.data.password).not.toBe('password123');
      const isHashed = await bcrypt.compare(
        'password123',
        createArgs.data.password,
      );
      expect(isHashed).toBe(true);
    });

    it('should throw ConflictException on duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
      });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: hashedPassword,
        role: Role.PATRON,
      });

      const result = await service.login({
        email: 'user@example.com',
        password: 'secret123',
      });

      expect(result.access_token).toBe('mock_jwt_token');
      expect(result.user.email).toBe('user@example.com');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'user@example.com', password: 'secret123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password incorrect', async () => {
      const hashedPassword = await bcrypt.hash('secret123', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        password: hashedPassword,
        role: Role.PATRON,
      });

      await expect(
        service.login({ email: 'user@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
