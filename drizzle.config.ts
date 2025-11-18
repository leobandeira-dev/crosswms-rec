import type { Config } from "drizzle-kit";

// Função para definir a configuração do Drizzle
const defineConfig = (config: Config) => config;

// Exigir somente a string de conexão do banco do Supabase
if (!process.env.SUPABASE_DB_URL) {
  throw new Error("SUPABASE_DB_URL precisa estar definido nas variáveis de ambiente");
}

export default defineConfig({
  out: "./migrations",
  // Usar apenas o schema principal da aplicação
  schema: ["./shared/schema.ts"],
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL,
  },
});
