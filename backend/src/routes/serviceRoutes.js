const express = require("express");
const db = require("../config/database");
const validateService = require("../middlewares/validateService");
const {
  authenticateToken,
  requireAdmin
} = require("../middlewares/authMiddleware");

const router = express.Router();

function getServiceSelectQuery() {
  return `
    SELECT
      services.id,
      services.title,
      services.shortDescription,
      services.fullDescription,
      services.startingPrice,
      services.deliveryTime,
      services.impactMetric,
      services.iconLabel,
      services.isFeatured,
      services.categoryId,
      service_categories.name AS categoryName,
      service_categories.slug AS categorySlug
    FROM services
    INNER JOIN service_categories 
      ON services.categoryId = service_categories.id
  `;
}

router.get("/categories", (req, res) => {
  const sql = `
    SELECT id, name, slug, description
    FROM service_categories
    ORDER BY name ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: "Error al obtener categorías",
        error: err.message
      });
    }

    res.json(rows);
  });
});

router.get("/services", (req, res) => {
  const { category } = req.query;

  let sql = getServiceSelectQuery();
  const params = [];

  if (category && category !== "all") {
    sql += " WHERE service_categories.slug = ?";
    params.push(category);
  }

  sql += " ORDER BY services.id DESC";

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({
        message: "Error al obtener servicios",
        error: err.message
      });
    }

    res.json(rows);
  });
});

router.get("/services/:id", (req, res) => {
  const { id } = req.params;

  const sql = `${getServiceSelectQuery()} WHERE services.id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({
        message: "Error al obtener servicio",
        error: err.message
      });
    }

    if (!row) {
      return res.status(404).json({
        message: "Servicio no encontrado"
      });
    }

    res.json(row);
  });
});

router.post(
  "/services",
  authenticateToken,
  requireAdmin,
  validateService,
  (req, res) => {
    const {
      title,
      shortDescription,
      fullDescription,
      startingPrice,
      deliveryTime,
      impactMetric,
      iconLabel,
      isFeatured,
      categoryId
    } = req.body;

    const sql = `
      INSERT INTO services (
        title,
        shortDescription,
        fullDescription,
        startingPrice,
        deliveryTime,
        impactMetric,
        iconLabel,
        isFeatured,
        categoryId
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      title,
      shortDescription,
      fullDescription,
      Number(startingPrice),
      deliveryTime,
      impactMetric,
      iconLabel,
      isFeatured ? 1 : 0,
      Number(categoryId)
    ];

    db.run(sql, params, function (err) {
      if (err) {
        return res.status(500).json({
          message: "Error al crear servicio",
          error: err.message
        });
      }

      res.status(201).json({
        message: "Servicio creado correctamente",
        serviceId: this.lastID
      });
    });
  }
);

router.put(
  "/services/:id",
  authenticateToken,
  requireAdmin,
  validateService,
  (req, res) => {
    const { id } = req.params;

    const {
      title,
      shortDescription,
      fullDescription,
      startingPrice,
      deliveryTime,
      impactMetric,
      iconLabel,
      isFeatured,
      categoryId
    } = req.body;

    const sql = `
      UPDATE services
      SET
        title = ?,
        shortDescription = ?,
        fullDescription = ?,
        startingPrice = ?,
        deliveryTime = ?,
        impactMetric = ?,
        iconLabel = ?,
        isFeatured = ?,
        categoryId = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [
      title,
      shortDescription,
      fullDescription,
      Number(startingPrice),
      deliveryTime,
      impactMetric,
      iconLabel,
      isFeatured ? 1 : 0,
      Number(categoryId),
      Number(id)
    ];

    db.run(sql, params, function (err) {
      if (err) {
        return res.status(500).json({
          message: "Error al actualizar servicio",
          error: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          message: "Servicio no encontrado"
        });
      }

      res.json({
        message: "Servicio actualizado correctamente"
      });
    });
  }
);

router.delete(
  "/services/:id",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    const { id } = req.params;

    const sql = `
      DELETE FROM services
      WHERE id = ?
    `;

    db.run(sql, [id], function (err) {
      if (err) {
        return res.status(500).json({
          message: "Error al eliminar servicio",
          error: err.message
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          message: "Servicio no encontrado"
        });
      }

      res.json({
        message: "Servicio eliminado correctamente"
      });
    });
  }
);

module.exports = router;