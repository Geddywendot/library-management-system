import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const book = await this.booksService.findOne(id);
    if (!book) {
      throw new NotFoundException(`Book with id "${id}" not found`);
    }

    return book;
  }
}
