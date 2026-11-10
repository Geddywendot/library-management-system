import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role } from '@prisma/client';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL must be set before seeding the database.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const genresData = [
  {
    name: 'Fantasy',
    books: [
      { title: 'The Dragon Keeper', author: 'Mira Vale', isbn: '9780000000001', publishedYear: 2020 },
      { title: 'The Glass Kingdom', author: 'Rowan Ash', isbn: '9780000000002', publishedYear: 2018 },
      { title: 'A Map of Stars', author: 'Lena North', isbn: '9780000000003', publishedYear: 2022 },
      { title: 'The Last Enchanter', author: 'Elias Wren', isbn: '9780000000004', publishedYear: 2016 },
    ],
  },
  {
    name: 'Science Fiction',
    books: [
      { title: 'Orbit of Silence', author: 'Niko Reed', isbn: '9780000000005', publishedYear: 2021 },
      { title: 'The Lunar Archive', author: 'Sana Quill', isbn: '9780000000006', publishedYear: 2019 },
      { title: 'Signal from Europa', author: 'Tariq Vale', isbn: '9780000000007', publishedYear: 2023 },
      { title: 'Tomorrow Engine', author: 'June Mercer', isbn: '9780000000008', publishedYear: 2017 },
    ],
  },
  {
    name: 'Mystery',
    books: [
      { title: 'The Quiet Alibi', author: 'Cora Finch', isbn: '9780000000009', publishedYear: 2015 },
      { title: 'Murder at North Pier', Felix: 'Ward', author: 'Felix Ward', isbn: '9780000000010', publishedYear: 2020 },
      { title: 'The Missing Ledger', author: 'Amara Cole', isbn: '9780000000011', publishedYear: 2022 },
      { title: 'A Case of Ashes', author: 'Theo Bell', isbn: '9780000000012', publishedYear: 2018 },
    ],
  },
  {
    name: 'Non-Fiction',
    books: [
      { title: 'Echoes of the Cosmos', author: 'Dr. Neil Vance', isbn: '9780000000013', publishedYear: 2021 },
      { title: 'The Mindful Habit', author: 'Maya Lin', isbn: '9780000000014', publishedYear: 2019 },
      { title: 'Silicon Horizons', author: 'David Zhang', isbn: '9780000000015', publishedYear: 2023 },
      { title: 'The Architecture of Thought', author: 'Clara Oswald', isbn: '9780000000016', publishedYear: 2020 },
    ],
  },
  {
    name: 'Historical Fiction',
    books: [
      { title: 'Letters from the Seine', author: 'Camille Laurent', isbn: '9780000000017', publishedYear: 2014 },
      { title: 'The Silk Road Merchant', author: 'Tariq Al-Mansoor', isbn: '9780000000018', publishedYear: 2017 },
      { title: 'Shadows of the Colosseum', author: 'Marcus Vane', isbn: '9780000000019', publishedYear: 2019 },
      { title: 'The Clockmaker of Prague', author: 'Anton Richter', isbn: '9780000000020', publishedYear: 2021 },
    ],
  },
];

async function main() {
  console.log('Seeding database...');

  // Seed Genres and Books
  let firstBookId: string | null = null;
  for (const { name, books } of genresData) {
    const genre = await prisma.genre.upsert({
      where: { name },
      update: {},
      create: { name },
    });

    for (const book of books) {
      const bookData = {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        publishedYear: book.publishedYear,
      };

      const upsertedBook = await prisma.book.upsert({
        where: { isbn: book.isbn },
        update: { ...bookData, genreId: genre.id },
        create: { ...bookData, genreId: genre.id },
      });

      if (!firstBookId) {
        firstBookId = upsertedBook.id;
      }
    }
  }

  // Seed Users with Role Enum
  const patron = await prisma.user.upsert({
    where: { email: 'patron@example.com' },
    update: { role: Role.PATRON },
    create: {
      name: 'Sample Patron',
      email: 'patron@example.com',
      role: Role.PATRON,
    },
  });

  await prisma.user.upsert({
    where: { email: 'librarian@example.com' },
    update: { role: Role.LIBRARIAN },
    create: {
      name: 'Head Librarian',
      email: 'librarian@example.com',
      role: Role.LIBRARIAN,
    },
  });

  // Seed sample Review (Stretch task)
  if (firstBookId && patron) {
    await prisma.review.upsert({
      where: {
        bookId_userId: {
          bookId: firstBookId,
          userId: patron.id,
        },
      },
      update: {
        rating: 5,
        comment: 'An enchanting read with compelling world-building and unforgettable characters.',
      },
      create: {
        bookId: firstBookId,
        userId: patron.id,
        rating: 5,
        comment: 'An enchanting read with compelling world-building and unforgettable characters.',
      },
    });
  }

  console.log('Seeding completed successfully: 5 genres, 20 books, 2 users (Patron and Librarian), and sample review.');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
