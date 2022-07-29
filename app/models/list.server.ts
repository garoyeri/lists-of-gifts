import type { User, GiftList, GiftListItem } from "@prisma/client";

import { prisma } from "~/db.server";

export function getGiftListsOwned({ userId }: { userId: User["id"] }) {
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
          id: userId,
        },
      },
    },
  });
}

export function getGiftList({
  userId,
  listId,
}: {
  userId: User["id"];
  listId: GiftList["id"];
}) {
  return prisma.giftList.findFirst({
    select: {
      id: true,
      title: true,
      items: {
        select: {
          id: true,
          title: true,
          url: true,
          imageUrl: true,
          details: true,
        },
      },
    },
    where: { id: listId, userId },
  });
}

export function requireEditableList({
  userId,
  listId,
}: {
  userId: User["id"];
  listId: GiftList["id"];
}) {
  return prisma.giftList.findFirst({
    select: { id: true },
    where: { id: listId, userId },
  });
}

export async function createGiftListItem({
  userId,
  listId,
  item,
}: {
  userId: User["id"];
  listId: GiftListItem["listId"];
  item: Pick<GiftListItem, "title" | "url" | "imageUrl" | "details">;
}) {
  const listFound = await requireEditableList({ userId, listId });
  if (!listFound) return undefined;

  return await prisma.giftListItem.create({
    data: {
      ...item,
      listId,
    },
  });
}

export function getGiftListItem({
  userId,
  listId,
  itemId,
}: {
  userId: User["id"];
  listId: GiftListItem["listId"];
  itemId: GiftListItem["id"];
}) {
  return prisma.giftListItem.findFirst({
    select: {
      id: true,
      title: true,
      url: true,
      imageUrl: true,
      details: true,
    },
    where: {
      id: itemId,
      listId: listId,
      list: {
        userId: userId,
      },
    },
  });
}

export async function updateGiftListItem({
  userId,
  listId,
  itemId,
  item,
}: {
  userId: User["id"];
  listId: GiftListItem["listId"];
  itemId: GiftListItem["id"];
  item: Pick<GiftListItem, "title" | "url" | "imageUrl" | "details">;
}) {
  const listFound = await requireEditableList({ userId, listId });
  if (!listFound) return undefined;

  return await prisma.giftListItem.update({
    where: { id: itemId },
    data: {
      ...item,
    },
  });
}
