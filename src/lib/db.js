// src/lib/db.js
import { Database } from 'sqlite3';

const db = new Database('chat.db', err => {
  if (err) console.error('DB opening error', err);
});

db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      title TEXT DEFAULT 'Nueva conversación',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  // mensajes
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversationId INTEGER,
      role TEXT,
      content TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // modos de IA
  db.run(`
    CREATE TABLE IF NOT EXISTS ia_modes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      prompt TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // modelos de IA
  db.run(`
    CREATE TABLE IF NOT EXISTS ia_models (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE,
      modelId TEXT UNIQUE,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      passwordHash TEXT,
      role TEXT,
      modeId INTEGER DEFAULT NULL,
      modelId INTEGER DEFAULT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(modeId)  REFERENCES ia_modes(id),
      FOREIGN KEY(modelId) REFERENCES ia_models(id)
    )
  `);
});

export default db;
