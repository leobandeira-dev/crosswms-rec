import type { Config } from "drizzle-kit";

// Função para definir a configuração do Drizzle
const defineConfig = (config: Config) => config;

// Verificar se as variáveis de ambiente necessárias estão definidas
if (!process.env.DATABASE_URL && !process.env.SUPABASE_URL) {
  throw new Error("DATABASE_URL ou SUPABASE_URL precisam estar definidos nas variáveis de ambiente");
}

export default defineConfig({
  out: "./migrations",
  // Incluir ambos os schemas para suportar tanto o banco PostgreSQL direto quanto o Supabase
  schema: ["./shared/schema.ts", "./shared/schema-supabase.ts"],
  dialect: "postgresql",
  dbCredentials: {
    // Usar DATABASE_URL se disponível, caso contrário usar SUPABASE_URL
    url: process.env.DATABASE_URL || process.env.SUPABASE_URL,
  },
});
