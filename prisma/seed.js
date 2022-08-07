const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  const user1 = await createUser("garoyeri@gmail.com", "garoiscool");
  const user2 = await createUser("garo.yeriazarian@gmail.com", "garoiscool");

  // create a list for the first user and add some items
  await prisma.giftList.create({
    data: {
      title: "Birthday Gift Ideas",
      permissions: {
        create: {
          user: {
            connect: {
              id: user1.id,
            },
          },
          permission: "OWNER",
        }
      },
      items: {
        createMany: {
          data: [
            {
              title: "Retro Phone",
              details: "Old phone that reminds me of my youth",
              url: "https://www.amazon.com/Med-Pat-TL-R-Slim-Line-Telephone/dp/B00FQICVWQ/",
              imageUrl:
                "https://m.media-amazon.com/images/I/31Jo-F7jqwL._AC_.jpg",
            },
            {
              title: "Another Retro Phone",
              details: "Remember when... ?",
              url: "https://www.amazon.com/dp/B079JR9N9V/",
              imageUrl:
                "https://m.media-amazon.com/images/I/71BTPU0GrkL._AC_SL1500_.jpg",
            },
          ],
        },
      },
    }
  });

  console.log(`Database has been seeded. 🌱`);
}

async function createUser(email, password) {
  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  console.log(`Created user: ${user.id}: ${user.email}`);

  return user;
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
