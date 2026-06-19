/**
 * Backend entry point (placeholder).
 *
 * The service doesn't expose any HTTP routes yet. When it does, this
 * file will boot the chosen framework, attach the auth middleware
 * from `./middleware/auth.ts`, and mount the route handlers from
 * `./routes/`.
 */
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";

logger.info("CareerBridge backend stub booted", {
  nodeEnv: env.nodeEnv,
  port: env.port,
});

// Intentionally does nothing more. Replace with a real server boot
// when the service grows past the stub phase.
