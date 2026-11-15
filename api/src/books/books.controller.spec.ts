import { Test, TestingModule } from '@nestjs/testing';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

describe('BooksController', () => {
  let controller: BooksController;
  let service: {
    findAll: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should read query parameters in findAll', async () => {
    service.findAll.mockResolvedValue([]);
    await controller.findAll('1', 'tolkien', '2', '5');

    expect(service.findAll).toHaveBeenCalledWith({
      genreId: 1,
      search: 'tolkien',
      page: 2,
      limit: 5,
    });
  });

  it('should call findOne', async () => {
    service.findOne.mockResolvedValue({ id: 1, title: 'Book' });
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: 1, title: 'Book' });
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should call create', async () => {
    const dto = {
      title: 'Book',
      author: 'Author',
      isbn: '1234567890',
      totalCopies: 2,
      genreId: 1,
    };
    service.create.mockResolvedValue({ id: 1, ...dto });
    const result = await controller.create(dto);
    expect(result).toEqual({ id: 1, ...dto });
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call update', async () => {
    service.update.mockResolvedValue({ id: 1, title: 'Updated' });
    const result = await controller.update('1', { title: 'Updated' });
    expect(result).toEqual({ id: 1, title: 'Updated' });
    expect(service.update).toHaveBeenCalledWith('1', { title: 'Updated' });
  });

  it('should call remove', async () => {
    service.remove.mockResolvedValue({ id: 1 });
    const result = await controller.remove('1');
    expect(result).toEqual({ id: 1 });
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
