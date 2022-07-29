import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import GiftListItemView from "~/components/list-item-view";
import { getGiftList } from "~/models/list.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  data: NonNullable<Awaited<ReturnType<typeof getGiftList>>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(
    params.listId,
    "List was not found or you don't have permission to view it"
  );

  const list = await getGiftList({ userId, listId: params.listId });
  if (!list) {
    throw new Response("Not found or you don't have permission to view", {
      status: 404,
    });
  }

  return json<LoaderData>({ data: list });
};

export default function ListDetailsPage() {
  const { data } = useLoaderData<LoaderData>();
  const isOwner = data.permission === "OWNER";

  return (
    <div>
      <div className="mb-4 flex align-baseline gap-2">
        <h3 className="flex-1 text-2xl font-bold">{data.list.title}{!isOwner ? ` (${data.user.email})` : undefined}</h3>
        {isOwner ? (
          <>
            <Link to="items/new" className="btn btn-primary flex-none">
              + New Item
            </Link>
            <Link to="sharing" className="btn btn-primary flex-none">
              Sharing
            </Link>
          </>
        ) : undefined}
      </div>
      <div className="container">
        <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.list.items.map((item) => {
            return (
              <GiftListItemView
                key={item.id}
                item={item}
                isOwner={isOwner}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
