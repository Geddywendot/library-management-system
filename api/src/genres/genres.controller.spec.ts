import { Test, TestingModule } from '@nestjs/testing';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';

describe('GenresController', () => {
  let controller: GenresController;
  let service: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenresController],
      providers: [
        {
          provide: GenresService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<GenresController>(GenresController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create', async () => {
    service.create.mockResolvedValue({ id: 1, name: 'Sci-Fi' });
    const result = await controller.create({ name: 'Sci-Fi' });
    expect(result).toEqual({ id: 1, name: 'Sci-Fi' });
    expect(service.create).toHaveBeenCalledWith({ name: 'Sci-Fi' });
  });

  it('should call findAll', async () => {
    service.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call findOne', async () => {
    service.findOne.mockResolvedValue({ id: 1, name: 'Sci-Fi' });
    const result = await controller.findOne('1');
    expect(result).toEqual({ id: 1, name: 'Sci-Fi' });
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('should call update', async () => {
    service.update.mockResolvedValue({ id: 1, name: 'Science Fiction' });
    const result = await controller.update('1', { name: 'Science Fiction' });
    expect(result).toEqual({ id: 1, name: 'Science Fiction' });
    expect(service.update).toHaveBeenCalledWith('1', {
      name: 'Science Fiction',
    });
  });

  it('should call remove', async () => {
    service.remove.mockResolvedValue({ id: 1 });
    const result = await controller.remove('1');
    expect(result).toEqual({ id: 1 });
    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
