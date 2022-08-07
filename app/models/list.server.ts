import type {
  User,
  GiftList,
  GiftListItem,
  GiftListPermissions,
} from "@prisma/client";

import { prisma } from "~/db.server";
import { getUserByEmail } from "./user.server";

/**
 * Gets the gift lists that are accessible to the given user.
 * 
 * @param userId The ID of the user whose gift lists to retrieve. 
 * @returns A list of gift list permissions, empty list if none available.
 * 
 * @remarks
 * Permissions can be of `OWNER` or `VIEWER` type (`EDITOR` isn't used yet).
 * To see what lists belong to the user, find the `OWNER` roles. Shared lists
 * would be either `VIEWER` or `EDITOR`.
 */
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

/**
 * Create a new gift list owned by the specified user.
 * 
 * @param userId The ID of the user who will own the new list.
 * @param title The title to use for the list. 
 * @returns A newly created gift list.
 * 
 * @remarks
 * Default permission is "OWNER" when creating a gift list, so
 * we don't need to specify the value.
 */
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

/**
 * Get the details for a specific gift list.
 * 
 * @param userId The ID of the user requesting the gift list.
 * @param listId The ID of the list being requested.
 * @returns The specified list permission with its list contents,
 * or undefined if not found or not allowed.
 */
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

/**
 * Assert that at least an editing permission is required for
 * the specified user on the specified list.
 * 
 * @param userId The ID of the user requesting to edit a list.
 * @param listId The ID of the list requesting to be edited.
 * @returns The permission level of the user on the list, or undefined
 * if not found or not permitted.
 */
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

/**
 * Assert that at least an owner permission is required for
 * the specified user on the specified list.
 * 
 * @param userId The ID of the user requesting to administer a list.
 * @param listId The ID of the list requesting to be administered.
 * @returns The permission level of the user on the list, or undefined
 * if not found or not permitted.
 */
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

/**
 * Create a new item in the gift list.
 * 
 * @param userId The ID of the user adding the new item.
 * @param listId The ID of the list to add the item to.
 * @param item The item details being added. 
 * @returns The added item, or undefined if not found or allowed.
 */
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

/**
 * Get a gift list item detail.
 * 
 * @param userId The ID of the user requesting the item.
 * @param listId The ID of the list where the item is located.
 * @param itemId The ID of the item to be gotten. 
 * @returns The item details or undefined it it is not found or
 * the user doesn't have any permissions on the list.
 */
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

/**
 * Edit a gift list item.
 * @param userId The ID of the user editing the item
 * @param listId The ID of the list containing the item
 * @param itemId The ID of the item being edited
 * @param item The changes ot the item. Undefined keys will be ignored.
 * @returns The updated item or undefined if not found or permitted to edit.
 */
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

/**
 * Get the sharing details for a gift list.
 * @param userId The ID of the user requesting the share list
 * @param listId The ID of the list
 * @returns The sharing permissions for the gift list, or
 * undefined if not permitted (not OWNER permission).
 */
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

/**
 * Share a gift list with another user.
 * @param userId The ID of the user sharing the list
 * @param listId The ID of the list to be shared
 * @param email The email address of the user to share the list with
 * @returns The newly created permission of the list, or undefined if
 * not found or permitted.
 */
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

/**
 * Remove a user from being shared with the list.
 * @param userId The ID of the user requesting to unshare the list
 * @param targetUserId The ID of the user whose permission is being removed
 * @param listId The ID of the list whose access is meant to be removed 
 * @returns The deleted permission, or undefined if not found or permitted
 * 
 * @remarks
 * OWNER permission is required to unshare a list, but you can't remove
 * your own permission on the list (effectively orphaning it).
 */
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
