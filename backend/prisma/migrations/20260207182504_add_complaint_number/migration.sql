/*
  Warnings:

  - A unique constraint covering the columns `[complaintNumber]` on the table `Query` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `complaintNumber` to the `Query` table without a default value. This is not possible if the table is not empty.

*/

-- Step 1: Add column as nullable first
ALTER TABLE "Query" ADD COLUMN "complaintNumber" TEXT;

-- Step 2: Backfill existing rows with unique complaint numbers based on id
UPDATE "Query" SET "complaintNumber" = 'CMP-LEGACY-' || LPAD(CAST(id AS TEXT), 5, '0');

-- Step 3: Make the column NOT NULL after backfill
ALTER TABLE "Query" ALTER COLUMN "complaintNumber" SET NOT NULL;

-- CreateTable
CREATE TABLE "SequenceCounter" (
    "id" TEXT NOT NULL,
    "lastValue" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SequenceCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Query_complaintNumber_key" ON "Query"("complaintNumber");

-- CreateIndex
CREATE INDEX "Query_complaintNumber_idx" ON "Query"("complaintNumber");
