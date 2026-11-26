import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

const GENRES = ['Fantasy', 'Science Fiction', 'Mystery', 'Biography'];

const BOOKS = [
  { title: 'The Hobbit', author: 'J.R.R. Tolkien', isbn: '9780547928227', genre: 'Fantasy' },
  { title: 'The Name of the Wind', author: 'Patrick Rothfuss', isbn: '9780756404741', genre: 'Fantasy' },
  { title: 'Mistborn', author: 'Brandon Sanderson', isbn: '9780765350381', genre: 'Fantasy' },
  { title: 'A Wizard of Earthsea', author: 'Ursula K. Le Guin', isbn: '9780547773742', genre: 'Fantasy' },
  { title: 'Dune', author: 'Frank Herbert', isbn: '9780441172719', genre: 'Science Fiction' },
  { title: 'Neuromancer', author: 'William Gibson', isbn: '9780441569595', genre: 'Science Fiction' },
  { title: 'The Left Hand of Darkness', author: 'Ursula K. Le Guin', isbn: '9780441478125', genre: 'Science Fiction' },
  { title: 'Foundation', author: 'Isaac Asimov', isbn: '9780553293357', genre: 'Science Fiction' },
  { title: 'The Big Sleep', author: 'Raymond Chandler', isbn: '9780394758282', genre: 'Mystery' },
  { title: 'Gone Girl', author: 'Gillian Flynn', isbn: '9780307588371', genre: 'Mystery' },
  { title: 'The Girl with the Dragon Tattoo', author: 'Stieg Larsson', isbn: '9780307454546', genre: 'Mystery' },
  { title: 'And Then There Were None', author: 'Agatha Christie', isbn: '9780062073488', genre: 'Mystery' },
  { title: 'Educated', author: 'Tara Westover', isbn: '9780399590504', genre: 'Biography' },
  { title: 'Steve Jobs', author: 'Walter Isaacson', isbn: '9781451648539', genre: 'Biography' },
  { title: 'Becoming', author: 'Michelle Obama', isbn: '9781524763138', genre: 'Biography' },
  { title: 'Into the Wild', author: 'Jon Krakauer', isbn: '9780385486804', genre: 'Biography' },
];

async function main(): Promise<void> {
  const genreMap = new Map<string, number>();

  for (const name of GENRES) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const genre = await prisma.genre.upsert({
      where: { name },
      update: { slug },
      create: { name, slug },
    });
    genreMap.set(genre.name, genre.id);
  }

  for (const book of BOOKS) {
    const genreId = genreMap.get(book.genre);
    if (!genreId) throw new Error(`Missing genre: ${book.genre}`);

    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {
        title: book.title,
        author: book.author,
        description: `${book.title} by ${book.author}.`,
        totalCopies: 3,
        availableCopies: 3,
        genreId,
      },
      create: {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        description: `${book.title} by ${book.author}.`,
        totalCopies: 3,
        availableCopies: 3,
        genreId,
      },
    });
  }

  const patron = await prisma.user.upsert({
    where: { email: 'patron@library.local' },
    update: {},
    create: {
      email: 'patron@library.local',
      password: 'placeholder-hashed-password',
      role: Role.PATRON,
    },
  });

  await prisma.user.upsert({
    where: { email: 'librarian@library.local' },
    update: {},
    create: {
      email: 'librarian@library.local',
      password: 'placeholder-hashed-password',
      role: Role.LIBRARIAN,
    },
  });

  const dune = await prisma.book.findUnique({ where: { isbn: '9780441172719' } });
  if (dune) {
    await prisma.review.upsert({
      where: { bookId_userId: { bookId: dune.id, userId: patron.id } },
      update: {},
      create: {
        bookId: dune.id,
        userId: patron.id,
        rating: 5,
        comment: 'A landmark in science fiction.',
      },
    });
  }

  console.log(`Seeded ${GENRES.length} genres, ${BOOKS.length} books, 2 users, and 1 review.`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
