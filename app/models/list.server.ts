import type { User, GiftList, GiftListItem } from "@prisma/client";

import { prisma } from "~/db.server";

export function getGiftLists({ userId }: { userId: User["id"] }) {
  return prisma.giftList.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createGiftList({
  userId,
  title,
}: Pick<GiftList, "title"> & { userId: User["id"] }) {
  return prisma.giftList.create({
    data: {
      title,
      user: {
        connect: {
          id: userId
        }
      }
    }
  });
}
