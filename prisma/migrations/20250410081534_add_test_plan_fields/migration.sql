-- AlterTable
ALTER TABLE "TestPlan" ADD COLUMN     "content" TEXT,
ADD COLUMN     "implementation" TEXT,
ADD COLUMN     "isAIGenerated" BOOLEAN NOT NULL DEFAULT false;
