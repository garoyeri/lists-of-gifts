/*
  Warnings:

  - You are about to drop the column `userId` on the `GiftList` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GiftList" DROP CONSTRAINT "GiftList_userId_fkey";

-- AlterTable
ALTER TABLE "GiftList" DROP COLUMN "userId";
