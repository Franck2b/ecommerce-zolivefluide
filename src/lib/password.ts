import { hash, verify } from "@node-rs/argon2";

// Paramètres argon2id recommandés par l'OWASP (19 Mio, 2 itérations).
const options = { memoryCost: 19456, timeCost: 2, parallelism: 1 };

export function hashPassword(password: string) {
  return hash(password, options);
}

export function verifyPassword(passwordHash: string, password: string) {
  return verify(passwordHash, password, options);
}
