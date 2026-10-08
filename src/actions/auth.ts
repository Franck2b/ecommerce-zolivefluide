"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { createSession, destroySession, safeReturnPath } from "@/lib/auth";
import { adoptGuestCart } from "@/lib/cart";
import { hashPassword, verifyPassword } from "@/lib/password";
import { isRateLimited, resetRateLimit } from "@/lib/rate-limit";
import { fieldErrors, signInSchema, signUpSchema, type FieldErrors } from "@/lib/validation";

export type AuthState = {
  error?: string;
  fields?: FieldErrors;
  values?: { name?: string; email?: string };
};

// Hash factice : la vérification prend le même temps, que l'e-mail existe ou non.
const DUMMY_HASH = hashPassword("timing-attack-mitigation");

async function clientIp() {
  return (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const input = Object.fromEntries(formData);
  const parsed = signUpSchema.safeParse(input);
  const values = { name: String(input.name ?? ""), email: String(input.email ?? "") };
  if (!parsed.success) return { fields: fieldErrors(parsed.error), values };

  const { name, email, password } = parsed.data;
  const [user] = await db
    .insert(users)
    .values({ name, email, passwordHash: await hashPassword(password) })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  if (!user) {
    return { fields: { email: ["Un compte existe déjà avec cette adresse. Connectez-vous."] }, values };
  }

  await createSession(user.id);
  await adoptGuestCart(user.id);
  redirect(safeReturnPath(formData.get("suite")));
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const input = Object.fromEntries(formData);
  const parsed = signInSchema.safeParse(input);
  const values = { email: String(input.email ?? "") };
  if (!parsed.success) return { fields: fieldErrors(parsed.error), values };

  const { email, password } = parsed.data;
  const limiterKey = `${await clientIp()}:${email}`;
  if (isRateLimited(limiterKey)) {
    return { error: "Trop de tentatives. Réessayez dans 15 minutes.", values };
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  const valid = await verifyPassword(user?.passwordHash ?? (await DUMMY_HASH), password);
  if (!user || !valid) return { error: "E-mail ou mot de passe incorrect.", values };

  resetRateLimit(limiterKey);
  await createSession(user.id);
  await adoptGuestCart(user.id);
  redirect(safeReturnPath(formData.get("suite")));
}

export async function signOut() {
  await destroySession();
  redirect("/");
}
