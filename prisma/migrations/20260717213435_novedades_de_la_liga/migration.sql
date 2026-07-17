-- CreateTable
CREATE TABLE "OrgPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "content" TEXT NOT NULL,
    "coverImageUrl" TEXT,
    "coverImagePublicId" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrgPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrgPost_organizationId_published_publishedAt_idx" ON "OrgPost"("organizationId", "published", "publishedAt");

-- AddForeignKey
ALTER TABLE "OrgPost" ADD CONSTRAINT "OrgPost_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
