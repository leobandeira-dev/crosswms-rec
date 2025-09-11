-- Manual migration: Copy data from Neon to Supabase
-- Step 1: Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Check if we can connect to Supabase
SELECT current_database(), current_user;