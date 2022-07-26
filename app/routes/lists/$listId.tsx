import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import { getGiftList } from "~/models/list.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
    list: NonNullable<Awaited<ReturnType<typeof getGiftList>>>;
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const userId = await requireUserId(request);
    invariant(params.listId, "List was not found or you don't have permission to view it");

    const list = await getGiftList({ userId, listId: params.listId });
    if (!list) {
        throw new Response("Not found or you don't have permission to view", { status: 404 });
    }

    return json<LoaderData>({ list });
};

export default function ListDetailsPage() {
    const data = useLoaderData<LoaderData>();

    return (
      <div className="container">
        <h3 className="text-2xl font-bold block w-full">{data.list.title}</h3>
        <div className="columns-xs gap-8 space-y-8">
            <div className="bg-secondary w-full h-80"></div>
            <div className="bg-secondary w-full h-80"></div>
            <div className="bg-secondary w-full h-80"></div>
            <div className="bg-secondary w-full h-80"></div>
            <div className="bg-secondary w-full h-80"></div>
            <div className="bg-secondary w-full h-80"></div>
        </div>
      </div>
    );
}