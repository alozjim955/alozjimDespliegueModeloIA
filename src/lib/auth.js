// src/lib/auth.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

// Hash de contraseña
export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Comparar contraseña
export async function comparePasswords(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Genera un JWT con payload { sub: userId, role }
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

// Verifica el JWT y devuelve el payload
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
