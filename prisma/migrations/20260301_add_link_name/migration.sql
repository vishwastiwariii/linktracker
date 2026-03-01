-- Step 1: add name as nullable
ALTER TABLE "Link" ADD COLUMN "name" TEXT;

-- Step 2: backfill existing rows — derive name from "originalUrl"
UPDATE "Link" SET "name" = regexp_replace(
  regexp_replace("originalUrl", '^https?://(www\.)?', ''),
  '[/?#].*$', ''
) WHERE "name" IS NULL;

-- Step 3: make name NOT NULL now that all rows have a value
ALTER TABLE "Link" ALTER COLUMN "name" SET NOT NULL;
