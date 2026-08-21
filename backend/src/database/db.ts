import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Configuration de connexion PostgreSQL
// Supporte l'URL directe ou les variables par défaut pour Docker (port 5432 ou 15432)
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:changeme@localhost:5432/congo_art_music';

export const pool = new Pool({
  connectionString: connectionString,
});

pool.on('connect', () => {
  console.log('📦 Connecté avec succès à PostgreSQL (congo_art_music)');
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion PostgreSQL :', err);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
