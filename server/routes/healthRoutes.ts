import { Router } from "express";

const healthRoutes = Router();

healthRoutes.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      version: "0.1.0",
      timestamp: new Date().toISOString(),
    },
  });
});

export { healthRoutes };
