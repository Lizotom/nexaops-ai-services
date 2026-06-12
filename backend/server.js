require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/authRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  }
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API NexaOps AI Services funcionando correctamente",
    version: "1.0.0"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api", serviceRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});