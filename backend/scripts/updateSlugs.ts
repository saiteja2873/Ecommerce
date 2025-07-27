import { PrismaClient } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

async function updateSlugs() {
  const products = await prisma.product.findMany();

  for (const product of products) {
    const baseSlug = slugify(product.name, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { slug },
    });

    console.log(`Updated ${product.name} → ${slug}`);
  }
}

updateSlugs()
  .then(() => {
    console.log("Done");
    prisma.$disconnect();
  })
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
  });
