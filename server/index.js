import express from 'express';
import cors from 'cors';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Servir frontend compilado
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// Conexión a PostgreSQL
const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_NAME || 'formulariodb',
});

// Inicialización de la base de datos con tabla de pastelería
async function initDB(retries = 10, delay = 3000) {
  while (retries > 0) {
    try {
      console.log(`[DB] Conectando a PostgreSQL...`);
      const client = await pool.connect();
      
      await client.query(`
        CREATE TABLE IF NOT EXISTS pedidos_pasteles (
          id SERIAL PRIMARY KEY,
          cliente VARCHAR(120) NOT NULL,
          telefono VARCHAR(50) NOT NULL,
          pastel VARCHAR(100) NOT NULL,
          tamano VARCHAR(50) NOT NULL,
          mensaje TEXT,
          creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      client.release();
      console.log('✅ [DB] Conectado y tabla "pedidos_pasteles" lista.');
      return;
    } catch (err) {
      console.error(`❌ [DB] Error al conectar: ${err.message}. Reintentando en ${delay / 1000}s...`);
      retries--;
      if (retries === 0) {
        console.error('❌ [DB] Falló conexión definitiva a PostgreSQL.');
      } else {
        await new Promise(res => setTimeout(res, delay));
      }
    }
  }
}

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', db: 'connected', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

// Obtener pedidos de pasteles
app.get('/api/pedidos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM pedidos_pasteles ORDER BY creado_en DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    res.status(500).json({ error: 'Error al consultar pedidos en la base de datos' });
  }
});

// Guardar nuevo pedido de pastel
app.post('/api/pedidos', async (req, res) => {
  const { cliente, telefono, pastel, tamano, mensaje } = req.body;

  if (!cliente || !telefono || !pastel || !tamano) {
    return res.status(400).json({ error: 'Por favor completa todos los campos requeridos.' });
  }

  try {
    const query = `
      INSERT INTO pedidos_pasteles (cliente, telefono, pastel, tamano, mensaje)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [cliente.trim(), telefono.trim(), pastel.trim(), tamano.trim(), mensaje ? mensaje.trim() : 'Sin dedicatoria'];
    const { rows } = await pool.query(query, values);

    console.log(`🎂 [DB] Nuevo pedido guardado (ID: ${rows[0].id}) para ${cliente}`);
    res.status(201).json({
      mensaje: '¡Pedido guardado con éxito!',
      data: rows[0]
    });
  } catch (err) {
    console.error('Error al insertar pedido:', err);
    res.status(500).json({ error: 'Error al guardar el pedido en la base de datos' });
  }
});

// Fallback SPA
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) res.status(200).send('API Pastelería activa');
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎂 Servidor Pastelería activo en http://0.0.0.0:${PORT}`);
  initDB();
});
