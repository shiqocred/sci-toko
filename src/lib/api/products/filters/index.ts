import { categories, db, pets, suppliers } from "@/lib/db";
import { asc } from "drizzle-orm";

export const productFilter = async () => {
  const suppliersFilter = await db
    .select({
      name: suppliers.name,
      slug: suppliers.slug,
    })
    .from(suppliers)
    .orderBy(asc(suppliers.name));

  const categoriesFilter = await db
    .select({
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .orderBy(asc(categories.name));

  const petsFilter = await db
    .select({
      name: pets.name,
      slug: pets.slug,
    })
    .from(pets)
    .orderBy(asc(pets.name));

  const response = {
    suppliers: suppliersFilter,
    categories: categoriesFilter,
    pets: petsFilter,
    promos: [] as {
      name: string;
      slug: string;
    }[],
  };

  return response;
};
