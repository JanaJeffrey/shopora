/*
  Warnings:

  - You are about to alter the column `compareAtPrice` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "compareAtPrice" SET DATA TYPE DOUBLE PRECISION;
