import zod from "zod";

export const createProductSchema = zod.object({
  name: zod.string().min(1, "Le nom du produit est requis"),
  description: zod.string().optional(),
  price: zod.number().positive("Le prix doit être un nombre positif"),
  category: zod.string().optional(),
});

export const productIdSchema = zod.object({
  id: zod.string().length(24, "ID de produit invalide"),
});
