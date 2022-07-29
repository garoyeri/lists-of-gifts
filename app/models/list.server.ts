import type { User, GiftList, GiftListItem } from "@prisma/client";

import { prisma } from "~/db.server";

export async function getGiftListsOwned({ userId }: { userId: User["id"] }) {
  const permissions = await prisma.giftListPermissions.findMany({
    where: { userId },
    orderBy: {
      list: {
        updatedAt: "desc",
      },
    },
    select: {
      list: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  return permissions.map((p) => p.list);
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

export async function getGiftList({
  userId,
  listId,
}: {
  userId: User["id"];
  listId: GiftList["id"];
}) {
  const permission = await prisma.giftListPermissions.findUnique({
    where: { userId_listId: { userId, listId } },
    select: {
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

  return permission?.list;
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

export function createGiftListItem({
  userId,
  listId,
  item,
}: {
  userId: User["id"];
  listId: GiftListItem["listId"];
  item: Pick<GiftListItem, "title" | "url" | "imageUrl" | "details">;
}) {
  return prisma.giftListPermissions.update({
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
