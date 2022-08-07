import type {
  User,
  GiftList,
  GiftListItem,
  GiftListPermissions,
} from "@prisma/client";

import { prisma } from "~/db.server";
import { getUserByEmail } from "./user.server";

export async function getGiftLists({ userId }: { userId: User["id"] }) {
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

export async function createGiftList({
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

export async function requireEditing({
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

export async function requireOwner({
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
      permission: "OWNER",
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

export async function getGiftListItem({
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

export async function getGiftListSharing({
  userId,
  listId,
}: {
  userId: GiftListPermissions["userId"];
  listId: GiftListPermissions["listId"];
}) {
  const found = await requireOwner({ userId, listId });
  if (!found) return undefined;

  return prisma.giftListPermissions.findMany({
    where: { listId },
    orderBy: { user: { email: "asc" } },
    select: {
      permission: true,
      user: { select: { email: true, id: true } },
    },
  });
}

export async function shareGiftList({
  userId,
  listId,
  email,
}: {
  userId: GiftListPermissions["userId"];
  listId: GiftListPermissions["listId"];
  email: User["email"];
}) {
  const found = await requireOwner({ userId, listId });
  if (!found) return undefined;

  const targetUser = await getUserByEmail(email);
  if (!targetUser) return undefined;

  return prisma.giftListPermissions.upsert({
    create: {
      userId: targetUser.id,
      listId,
      permission: "VIEWER",
    },
    update: {},
    where: {
      userId_listId: { userId: targetUser.id, listId },
    },
  });
}

export async function unshareGiftList({
  userId,
  targetUserId,
  listId,
}: {
  userId: GiftListPermissions["userId"];
  targetUserId: GiftListPermissions["userId"];
  listId: GiftListPermissions["listId"];
}) {
  const found = await requireOwner({ userId, listId });
  if (!found) return undefined;
  if (userId === targetUserId) return undefined;

  return prisma.giftListPermissions.delete({
    where: { userId_listId: { userId: targetUserId, listId } },
  });
}
