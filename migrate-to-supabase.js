#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
const { Client } = pg;

// Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY; // Using anon key for now
const neonConnectionString = process.env.DATABASE_URL;

console.log('Starting Neon → Supabase Migration');
console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const neonClient = new Client({ connectionString: neonConnectionString });

async function testConnections() {
  try {
    // Test Neon connection
    await neonClient.connect();
    const neonResult = await neonClient.query('SELECT current_database(), version()');
    console.log('✓ Neon connection successful:', neonResult.rows[0]);

    // Test Supabase connection
    const { data, error } = await supabase.from('users').select('count').limit(1);
    if (error && error.code !== 'PGRST116') { // Table not found is OK
      throw error;
    }
    console.log('✓ Supabase connection successful');
  } catch (error) {
    console.error('Connection test failed:', error);
    process.exit(1);
  }
}

async function getTableCounts() {
  const tables = ['ordens_carga', 'notas_fiscais', 'volumes_etiqueta', 'itens_carga'];
  const counts = {};
  
  for (const table of tables) {
    try {
      const result = await neonClient.query(`SELECT COUNT(*) FROM ${table}`);
      counts[table] = parseInt(result.rows[0].count);
    } catch (error) {
      console.error(`Error counting ${table}:`, error.message);
      counts[table] = 0;
    }
  }
  
  return counts;
}

async function main() {
  try {
    await testConnections();
    
    const counts = await getTableCounts();
    console.log('Data to migrate:', counts);
    
    const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);
    console.log('Total records to migrate:', totalRecords);
    
    if (totalRecords > 0) {
      console.log('Migration ready. Run with --execute flag to proceed.');
      console.log('Next: node migrate-to-supabase.js --execute');
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await neonClient.end();
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { testConnections, getTableCounts };