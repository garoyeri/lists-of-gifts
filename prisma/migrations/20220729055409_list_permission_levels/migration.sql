-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- AlterTable
ALTER TABLE "GiftListPermissions" ADD COLUMN     "permission" "Permission" NOT NULL DEFAULT 'OWNER';
