function validateService(req, res, next) {
  const {
    title,
    shortDescription,
    fullDescription,
    startingPrice,
    deliveryTime,
    impactMetric,
    iconLabel,
    categoryId
  } = req.body;

  if (
    !title ||
    !shortDescription ||
    !fullDescription ||
    startingPrice === undefined ||
    !deliveryTime ||
    !impactMetric ||
    !iconLabel ||
    categoryId === undefined
  ) {
    return res.status(400).json({
      message: "Todos los campos obligatorios deben ser enviados."
    });
  }

  if (Number.isNaN(Number(startingPrice)) || Number(startingPrice) <= 0) {
    return res.status(400).json({
      message: "El precio inicial debe ser un número mayor a 0."
    });
  }

  if (Number.isNaN(Number(categoryId)) || Number(categoryId) <= 0) {
    return res.status(400).json({
      message: "La categoría debe ser válida."
    });
  }

  next();
}

module.exports = validateService;