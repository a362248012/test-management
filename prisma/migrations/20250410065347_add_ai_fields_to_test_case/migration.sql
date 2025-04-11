-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "aiHistory" JSONB,
ADD COLUMN     "aiPrompt" TEXT,
ADD COLUMN     "isAIGenerated" BOOLEAN NOT NULL DEFAULT false;
