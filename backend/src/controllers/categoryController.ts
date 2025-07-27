import prisma from "../prisma";

export const getAllCategories = async () => {
  return await prisma.category.findMany();
};

export const createCategory = async (data: { title: string; slug: string; image: string }) => {
  return await prisma.category.create({ data });
};

// ✅ NEW: Get a category with its associated products
export const getCategoryWithProducts = async (slug: string) => {
  return await prisma.category.findUnique({
    where: { slug },
    include: { products: true }, // Fetch all products for this category
  });
};
