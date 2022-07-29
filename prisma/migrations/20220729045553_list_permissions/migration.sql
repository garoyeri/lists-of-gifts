-- CreateTable
CREATE TABLE "GiftListPermissions" (
    "userId" VARCHAR(255) NOT NULL,
    "listId" VARCHAR(255) NOT NULL,

    CONSTRAINT "GiftListPermissions_pkey" PRIMARY KEY ("userId","listId")
);

-- AddForeignKey
ALTER TABLE "GiftListPermissions" ADD CONSTRAINT "GiftListPermissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GiftListPermissions" ADD CONSTRAINT "GiftListPermissions_listId_fkey" FOREIGN KEY ("listId") REFERENCES "GiftList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
