import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET; // ponlo en .env.local

/** hashea la contraseña */
export async function hashPassword(pw) {
  return bcrypt.hash(pw, SALT_ROUNDS);
}

/** compara el password con el hash */
export async function verifyPassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}

/** genera un JWT con la id del usuario */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/** verifica el token o lanza */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
