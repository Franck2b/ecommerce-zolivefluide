import { z } from "zod";
import { MAX_QUANTITY_PER_LINE } from "./pricing";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Saisissez une adresse e-mail valide." }));

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom (2 caractères minimum).").max(80),
  email,
  password: z
    .string()
    .min(10, "Le mot de passe doit contenir au moins 10 caractères.")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères."),
});

export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Saisissez votre mot de passe.").max(128),
});

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, "Indiquez le nom du destinataire.").max(100),
  addressLine1: z.string().trim().min(4, "Indiquez le numéro et la rue.").max(150),
  addressLine2: z
    .string()
    .trim()
    .max(150)
    .transform((v) => v || null),
  postalCode: z
    .string()
    .trim()
    .regex(/^(?:0[1-9]|[1-8]\d|9[0-5])\d{3}$/, "Saisissez un code postal de France métropolitaine."),
  city: z.string().trim().min(2, "Indiquez la ville.").max(80),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .pipe(z.string().regex(/^(?:\+33|0)[1-9]\d{8}$/, "Saisissez un numéro de téléphone français.")),
});

export const quantitySchema = z.coerce.number().int().min(0).max(MAX_QUANTITY_PER_LINE);

export const uuidSchema = z.uuid();

export const variantInputSchema = z
  .object({
    id: z.uuid().optional().or(z.literal("").transform(() => undefined)),
    label: z.string().trim().min(1, "Nommez la variante (taille, longueur…).").max(40),
    sku: z.string().trim().toUpperCase().min(3, "Référence trop courte.").max(40),
    priceCents: z.coerce.number().int().positive("Le prix doit être positif."),
    compareAtCents: z
      .union([z.literal("").transform(() => null), z.coerce.number().int().positive()])
      .nullable()
      .default(null),
    stock: z.coerce.number().int().min(0, "Le stock ne peut pas être négatif."),
  })
  .refine((v) => v.compareAtCents === null || v.compareAtCents > v.priceCents, {
    message: "Le prix barré doit être supérieur au prix de vente.",
    path: ["compareAtCents"],
  });

const specSchema = z.object({
  label: z.string().trim().min(1).max(40),
  value: z.string().trim().min(1).max(80),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2, "Nom trop court.").max(80),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lettres minuscules, chiffres et tirets uniquement."),
  brand: z.string().trim().min(2, "Indiquez la marque.").max(60),
  tagline: z.string().trim().min(5, "Accroche trop courte.").max(140),
  description: z.string().trim().min(20, "Description trop courte (20 caractères minimum).").max(2000),
  tip: z.string().trim().min(10, "Le mot du guide est trop court.").max(400),
  categoryId: z.uuid("Choisissez une catégorie."),
  image: z
    .string()
    .trim()
    .regex(/^\/images\/[a-z0-9/_-]+\.(?:jpe?g|png|webp)$/i, "Chemin d'image attendu, ex. /images/produits/sac.jpg."),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  specs: z.array(specSchema).max(8),
  variants: z.array(variantInputSchema).min(1, "Ajoutez au moins une variante."),
});

export type ProductInput = z.infer<typeof productInputSchema>;

export type FieldErrors = Record<string, string[] | undefined>;

export function fieldErrors(error: z.ZodError): FieldErrors {
  return z.flattenError(error).fieldErrors as FieldErrors;
}
