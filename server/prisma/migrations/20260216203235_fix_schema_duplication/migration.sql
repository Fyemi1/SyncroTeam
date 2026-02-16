-- AlterTable
ALTER TABLE "TaskTopic" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "completedBy" INTEGER;

-- AddForeignKey
ALTER TABLE "TaskTopic" ADD CONSTRAINT "TaskTopic_completedBy_fkey" FOREIGN KEY ("completedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
