import "dotenv/config";

const DEFAULT_DEV_CORS_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parseList(value) {
  return clean(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getRequired(name) {
  const value = clean(process.env[name]);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const nodeEnv = clean(process.env.NODE_ENV) || "development";
const isProduction = nodeEnv === "production";
const supabaseUrl = clean(process.env.SUPABASE_URL);
const supabaseBucketName = clean(process.env.SUPABASE_BUCKET_NAME) || "usuarios";
const supabasePublicBaseUrl =
  clean(process.env.SUPABASE_PUBLIC_BASE_URL) ||
  (supabaseUrl
    ? `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${supabaseBucketName}`
    : "");
const corsOrigins = parseList(process.env.CORS_ORIGINS);

export const env = {
  nodeEnv,
  isProduction,
  port: clean(process.env.PORT) || "3000",
  databaseUrl: clean(process.env.DATABASE_URL),
  jwtSecret: clean(process.env.JWT_SECRET),
  jwtExpiresIn: clean(process.env.JWT_EXPIRES_IN) || "9h",
  supabaseUrl,
  supabaseKey: clean(process.env.SUPABASE_KEY),
  supabaseBucketName,
  supabasePublicBaseUrl,
  corsOrigins: corsOrigins.length > 0 ? corsOrigins : DEFAULT_DEV_CORS_ORIGINS,
  mqttBrokerUrl: clean(process.env.MQTT_BROKER_URL) || "mqtt://broker.hivemq.com",
  mqttResponseTopic: clean(process.env.MQTT_RESPONSE_TOPIC) || "get-in-3td/dispositivos/res",
  mqttCommandTopicPrefix:
    clean(process.env.MQTT_COMMAND_TOPIC_PREFIX) || "get-in-3td/dispositivos",
};

export function requireEnv(name) {
  return getRequired(name);
}

export function validateEnv() {
  const required = ["DATABASE_URL", "JWT_SECRET", "SUPABASE_URL", "SUPABASE_KEY"];
  const missing = required.filter((name) => !clean(process.env[name]));

  if (isProduction && corsOrigins.length === 0) {
    missing.push("CORS_ORIGINS");
  }

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
