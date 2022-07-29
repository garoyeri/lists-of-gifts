import type { User, GiftList, GiftListItem } from "@prisma/client";

import { prisma } from "~/db.server";

export function getGiftLists({ userId }: { userId: User["id"] }) {
  return prisma.giftListPermissions.findMany({
    where: { userId },
    orderBy: {
      list: {
        updatedAt: "desc",
      },
    },
    select: {
      permission: true,
      list: {
        select: {
          id: true,
          title: true,
        },
      },
      user: {
        select: {
          email: true,
        },
      },
    },
  });
}

export function createGiftList({
  userId,
  title,
}: Pick<GiftList, "title"> & { userId: User["id"] }) {
  return prisma.giftList.create({
    data: {
      title,
      permissions: {
        create: {
          userId,
        },
      },
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
  return prisma.giftListPermissions.findUnique({
    where: { userId_listId: { userId, listId } },
    select: {
      permission: true,
      user: {
        select: {
          email: true,
        },
      },
      list: {
        select: {
          id: true,
          title: true,
          userId: true,
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
      },
    },
  });
}

export function requireEditing({
  userId,
  listId,
}: {
  userId: User["id"];
  listId: GiftList["id"];
}) {
  return prisma.giftListPermissions.findFirst({
    where: {
      userId,
      listId,
      permission: {
        in: ["OWNER", "EDITOR"],
      },
    },
    select: { permission: true },
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
  const found = await requireEditing({ userId, listId });
  if (!found) return undefined;

  return await prisma.giftListPermissions.update({
    where: { userId_listId: { userId, listId } },
    data: {
      list: {
        update: {
          items: {
            create: {
              ...item,
            },
          },
        },
      },
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
        permissions: {
          some: {
            userId,
          },
        },
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
  const found = await requireEditing({ userId, listId });
  if (!found) return undefined;

  return prisma.giftListPermissions.update({
    where: { userId_listId: { userId, listId } },
    data: {
      list: {
        update: {
          items: {
            update: {
              where: { id: itemId },
              data: { ...item },
            },
          },
        },
      },
    },
  });
}
