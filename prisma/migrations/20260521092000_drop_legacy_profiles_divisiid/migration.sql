-- Drop legacy direct divisi relation on profiles (moved to profile_divisi join table)
ALTER TABLE "profiles" DROP CONSTRAINT IF EXISTS "profiles_divisiId_fkey";
DROP INDEX IF EXISTS "profiles_divisiId_idx";
ALTER TABLE "profiles" DROP COLUMN IF EXISTS "divisiId";
