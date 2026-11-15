import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';

interface RegisterResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    role: Role;
  };
}

interface ProfileResponse {
  id: number;
  email: string;
  role: Role;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let patronToken: string;
  let librarianToken: string;

  beforeEach(async () => {
    const prismaMock = {
      book: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation(
          ({
            data,
          }: {
            data: {
              title: string;
              author: string;
              isbn: string;
              totalCopies: number;
              availableCopies: number;
              genreId: number;
            };
          }) => Promise.resolve({ id: 1, ...data }),
        ),
        update: jest.fn().mockImplementation(
          ({
            data,
          }: {
            data: {
              title?: string;
              author?: string;
              isbn?: string;
              totalCopies?: number;
              availableCopies?: number;
              genreId?: number;
            };
          }) => Promise.resolve({ id: 1, ...data }),
        ),
        delete: jest.fn().mockResolvedValue({ id: 1 }),
      },
      genre: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest
          .fn()
          .mockImplementation(
            ({ data }: { data: { name: string; slug: string } }) =>
              Promise.resolve({ id: 1, ...data }),
          ),
        update: jest
          .fn()
          .mockImplementation(
            ({ data }: { data: { name?: string; slug?: string } }) =>
              Promise.resolve({ id: 1, ...data }),
          ),
        delete: jest.fn().mockResolvedValue({ id: 1 }),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest
          .fn()
          .mockImplementation(
            ({
              data,
            }: {
              data: { email: string; password: string; role: Role };
            }) => Promise.resolve({ id: 1, ...data }),
          ),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    patronToken = jwtService.sign({
      sub: 1,
      email: 'patron@example.com',
      role: Role.PATRON,
    });
    librarianToken = jwtService.sign({
      sub: 2,
      email: 'librarian@example.com',
      role: Role.LIBRARIAN,
    });
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/books (GET)', () => {
    return request(app.getHttpServer()).get('/books').expect(200).expect([]);
  });

  it('/books (POST) - unauthorized without token', () => {
    return request(app.getHttpServer())
      .post('/books')
      .send({
        title: 'New Book',
        author: 'Author',
        isbn: '1234567890',
        totalCopies: 2,
        genreId: 1,
      })
      .expect(401);
  });

  it('/books (POST) - forbidden for PATRON', () => {
    return request(app.getHttpServer())
      .post('/books')
      .set('Authorization', `Bearer ${patronToken}`)
      .send({
        title: 'New Book',
        author: 'Author',
        isbn: '1234567890',
        totalCopies: 2,
        genreId: 1,
      })
      .expect(403);
  });

  it('/books (POST) - allowed for LIBRARIAN', () => {
    return request(app.getHttpServer())
      .post('/books')
      .set('Authorization', `Bearer ${librarianToken}`)
      .send({
        title: 'New Book',
        author: 'Author',
        isbn: '1234567890',
        totalCopies: 2,
        genreId: 1,
      })
      .expect(201);
  });

  it('/auth/register (POST) - validates invalid email', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'not-an-email',
        password: 'password123',
      })
      .expect(400);
  });

  it('/auth/register (POST) - registers valid user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'password123',
      })
      .expect(201)
      .expect((res: request.Response) => {
        const body = res.body as RegisterResponse;
        expect(body).toHaveProperty('access_token');
        expect(body.user.email).toBe('newuser@example.com');
      });
  });

  it('/genres (GET)', () => {
    return request(app.getHttpServer()).get('/genres').expect(200).expect([]);
  });

  it('/users/profile (GET) - returns authenticated user profile', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${patronToken}`)
      .expect(200)
      .expect((res: request.Response) => {
        const body = res.body as ProfileResponse;
        expect(body.email).toBe('patron@example.com');
        expect(body.role).toBe(Role.PATRON);
      });
  });
});
