export function notFound(_req, res, _next) {
  res.status(404).json({ message: "No encontrado" });
}

export function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Error del servidor" });
}
