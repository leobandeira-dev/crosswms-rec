import * as schema from "@shared/schema";
import { db as drizzleDb } from "./supabase";
import postgres from "postgres";

// Exportar schema unificado (Supabase/Drizzle)
export { schema };

// Conexão postgres-js usando a URL do banco do Supabase
const sql = postgres(process.env.SUPABASE_DB_URL || "", {
  max: 10,
  prepare: false,
});

// Expor um pool compatível com `.query(text, params)` usado nas rotas
export const pool = {
  query: async (text: string, params?: any[]) => {
    const result = await sql.unsafe(text, params ?? []);
    // Adaptar retorno para formato semelhante ao `pg.Pool`
    return { rows: result as any[] };
  },
};

// Exportar instância Drizzle já conectada ao Supabase
export const db = drizzleDb;
