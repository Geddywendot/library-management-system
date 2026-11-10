import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const genreNames = ['Fantasy', 'Science Fiction', 'Mystery', 'Biography'];
  const genres = await Promise.all(
    genreNames.map((name) =>
      prisma.genre.upsert({
        where: { name },
        update: {},
        create: { name, slug: name.toLowerCase().replace(/\s+/g, '-') },
      }),
    ),
  );

  const sampleBooks = [
    // Fantasy (5 books)
    { title: 'The Hobbit', author: 'J.R.R. Tolkien', genre: 'Fantasy', isbn: '9780007525492' },
    { title: 'The Fellowship of the Ring', author: 'J.R.R. Tolkien', genre: 'Fantasy', isbn: '9780007525546' },
    { title: 'The Two Towers', author: 'J.R.R. Tolkien', genre: 'Fantasy', isbn: '9780007525508' },
    { title: 'The Return of the King', author: 'J.R.R. Tolkien', genre: 'Fantasy', isbn: '9780007525515' },
    { title: 'A Game of Thrones', author: 'George R.R. Martin', genre: 'Fantasy', isbn: '9780553103540' },

    // Science Fiction (5 books)
    { title: 'Dune', author: 'Frank Herbert', genre: 'Science Fiction', isbn: '9780441172719' },
    { title: 'Neuromancer', author: 'William Gibson', genre: 'Science Fiction', isbn: '9780441569595' },
    { title: 'Foundation', author: 'Isaac Asimov', genre: 'Science Fiction', isbn: '9780553293357' },
    { title: 'Snow Crash', author: 'Neal Stephenson', genre: 'Science Fiction', isbn: '9780553380958' },
    { title: 'Hyperion', author: 'Dan Simmons', genre: 'Science Fiction', isbn: '9780553283686' },

    // Mystery (5 books)
    { title: 'The Big Sleep', author: 'Raymond Chandler', genre: 'Mystery', isbn: '9780394758282' },
    { title: 'The Maltese Falcon', author: 'Dashiell Hammett', genre: 'Mystery', isbn: '9780679722649' },
    { title: 'And Then There Were None', author: 'Agatha Christie', genre: 'Mystery', isbn: '9780062073488' },
    { title: 'The Hound of the Baskervilles', author: 'Arthur Conan Doyle', genre: 'Mystery', isbn: '9780140437867' },
    { title: 'Gone Girl', author: 'Gillian Flynn', genre: 'Mystery', isbn: '9780307588371' },

    // Biography (5 books)
    { title: 'Educated', author: 'Tara Westover', genre: 'Biography', isbn: '9780399590504' },
    { title: 'Steve Jobs', author: 'Walter Isaacson', genre: 'Biography', isbn: '9781451648539' },
    { title: 'Becoming', author: 'Michelle Obama', genre: 'Biography', isbn: '9781524763138' },
    { title: 'The Diary of a Young Girl', author: 'Anne Frank', genre: 'Biography', isbn: '9780553296983' },
    { title: 'Long Walk to Freedom', author: 'Nelson Mandela', genre: 'Biography', isbn: '9780316541427' },
  ];

  for (const book of sampleBooks) {
    const genre = genres.find((g) => g.name === book.genre);
    if (!genre) continue;

    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: {
        title: book.title,
        author: book.author,
        description: `${book.title} by ${book.author}.`,
        totalCopies: 3,
        availableCopies: 3,
        genreId: genre.id,
      },
      create: {
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        description: `${book.title} by ${book.author}.`,
        totalCopies: 3,
        availableCopies: 3,
        genreId: genre.id,
      },
    });
  }

  // Seed sample users with Role enum
  await prisma.user.upsert({
    where: { email: 'patron@example.com' },
    update: {},
    create: {
      email: 'patron@example.com',
      password: 'hashed_password_123',
      role: 'PATRON',
    },
  });

  await prisma.user.upsert({
    where: { email: 'librarian@example.com' },
    update: {},
    create: {
      email: 'librarian@example.com',
      password: 'hashed_password_456',
      role: 'LIBRARIAN',
    },
  });

  console.log('Seed completed successfully with 4 genres, 20 books, and users.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
