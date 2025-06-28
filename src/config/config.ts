import { z } from "zod";

const configSchema = z.object({
  // App configuration
  PORT: z.string().default("3001").transform(Number),
  NODE_ENV: z.string().default("development"),

  // MongoDB configuration
  MONGODB_HOST: z.string().min(1, "MONGODB_HOST is required"),
  MONGODB_PORT: z.string().default("27017").transform(Number),
  MONGODB_USERNAME: z.string().min(1, "MONGODB_USERNAME is required"),
  MONGODB_PASSWORD: z.string().min(1, "MONGODB_PASSWORD is required"),
  MONGODB_DATABASE: z.string().min(1, "MONGODB_DATABASE is required"),
  MONGODB_AUTH_SOURCE: z.string().default("admin"),

  // Logging configuration
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
});

export type Config = z.infer<typeof configSchema>;

export function validateConfig(): Config {
  try {
    const config = configSchema.parse(process.env);
    return config;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingFields = error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`,
      );
      throw new Error(
        `Configuration validation failed:\n${missingFields.join("\n")}`,
      );
    }
    throw error;
  }
}

export function getMongoUri(config: Config): string {
  const {
    MONGODB_HOST,
    MONGODB_PORT,
    MONGODB_USERNAME,
    MONGODB_PASSWORD,
    MONGODB_DATABASE,
    MONGODB_AUTH_SOURCE,
  } = config;
  return `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?authSource=${MONGODB_AUTH_SOURCE}`;
}
