import { categories, db, pets, promos, suppliers } from "@/lib/db";
import { asc } from "drizzle-orm";

export const productFilter = async () => {
  const [suppliersFilter, categoriesFilter, petsFilter, promoFilter] =
    await Promise.all([
      db.query.suppliers.findMany({
        columns: { name: true, slug: true },
        orderBy: asc(suppliers.name),
      }),
      db.query.categories.findMany({
        columns: { name: true, slug: true },
        orderBy: asc(categories.name),
      }),
      db.query.pets.findMany({
        columns: { name: true, slug: true },
        orderBy: asc(pets.name),
      }),
      db.query.promos.findMany({
        columns: { name: true, slug: true },
        orderBy: asc(promos.name),
      }),
    ]);

  const response = {
    suppliers: suppliersFilter,
    categories: categoriesFilter,
    pets: petsFilter,
    promos: promoFilter,
  };

  return response;
};
