// server.js
const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const fs = require("fs");

// Inicializar Express
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔗 Conexión a la base de datos de XAMPP
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "rodaniactividades_db"
});

// Verificar conexión
db.connect(err => {
  if (err) {
    console.error("❌ Error de conexión a MySQL:", err);
  } else {
    console.log("✅ Conexión a MySQL exitosa.");
  }
});

// 🧠 Endpoint para buscar actividades
app.get("/api/actividades", (req, res) => {
  const { q = "", area = "", grado = "", aprendizaje = "" } = req.query;

  const sql = `
    SELECT * FROM actividades
    WHERE LOWER(nombre) LIKE ?
      AND LOWER(area) LIKE ?
      AND LOWER(grado) LIKE ?
      AND LOWER(aprendizaje) LIKE ?`;

  const params = [
    `%${q.toLowerCase()}%`,
    `%${area.toLowerCase()}%`,
    `%${grado.toLowerCase()}%`,
    `%${aprendizaje.toLowerCase()}%`
  ];

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Error al consultar la base de datos" });
    }
    res.json(results);
  });
});

// 💾 Endpoint para descargar una actividad en PDF
app.get("/api/descargar/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM actividades WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(404).send("Actividad no encontrada");
    }

    const actividad = results[0];
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `actividad-${id}.pdf`);
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    // Contenido del PDF
    doc.fontSize(20).text("📘 Actividad Educativa", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Nombre: ${actividad.nombre}`);
    doc.moveDown();
    doc.fontSize(12).text(`Descripción: ${actividad.descripcion}`);
    doc.moveDown();
    doc.text(`Área: ${actividad.area}`);
    doc.text(`Grado: ${actividad.grado}`);
    doc.moveDown();
    doc.text(`Aprendizaje esperado:`);
    doc.font("Helvetica-Oblique").text(actividad.aprendizaje);
    doc.end();

    // Descargar el archivo cuando esté listo
    stream.on("finish", () => {
      res.download(filePath, `actividad-${id}.pdf`, err => {
        if (!err) fs.unlinkSync(filePath); // Elimina el archivo temporal
      });
    });
  });
});

// 🚀 Mostrar rutas registradas (verificación)

// 🚀 Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
