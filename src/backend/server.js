// backend/server.js

import express from "express";   // Importación de express
import axios from "axios";      // Importación de axios
import dotenv from "dotenv";    // Importación de dotenv
import cors from "cors";        // Importación de cors

dotenv.config();  // Cargar las variables de entorno desde .env

const app = express();
const port = 5000;

// Habilitar CORS para permitir solicitudes desde cualquier origen
app.use(cors());

// Opción de CORS más específica
const corsOptions = {
  origin: "http://localhost:5173", 
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Usa las opciones de CORS
app.use(cors(corsOptions));

// Middleware para manejar JSON
app.use(express.json());

// Ruta para manejar la petición del frontend
app.post("/chat", async (req, res) => {
  const userMessage = req.body.message;

  try {
    // Llamada a la API de OpenAI
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003", // Cambia el modelo si es necesario
        prompt: userMessage,
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: "Bearer " + process.env.OPENAI_API_KEY
        }
      }
    );

    // Devolver la respuesta de la IA al frontend
    const aiMessage = response.data.choices[0].text.trim();
    res.json({ message: aiMessage });

  } catch (error) {
    console.error("Error al obtener la respuesta de OpenAI:", error);
    res.status(500).json({ error: "Hubo un error al obtener la respuesta." });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`);
});