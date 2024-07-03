import sql from "mssql";

export const sqlConfig = {
  database: String(process.env.DB_NAME),
  server: String(process.env.DB_SERVER),
  user: String(process.env.DB_USER),
  password: String(process.env.DB_PASSWORD),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
    trustedConnection: true,
  },
} satisfies sql.config;
