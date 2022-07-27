import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";
import GiftListItemView from "~/components/list-item-view";
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
        <div>
            <div className="flex align-baseline mb-4">
                <h3 className="text-2xl font-bold w-full">{data.list.title}</h3>
                <Link to="items/new" className="btn btn-primary">New Item</Link>
            </div>
            <div className="container">
                <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    <GiftListItemView item={{ title: "Item 1", id: "123", details: "abc", url: "https://www.google.com", imageUrl: "https://placeimg.com/400/225/arch" }} isOwner={true} />
                    <GiftListItemView item={{ title: "Item 1", id: "123", details: "abc", url: "", imageUrl: "https://placeimg.com/400/225/arch" }} isOwner={true} />
                    <GiftListItemView item={{ title: "Item 1", id: "123", details: "abc", url: "", imageUrl: "https://placeimg.com/400/225/arch" }} isOwner={true} />
                    <GiftListItemView item={{ title: "Item 1", id: "123", details: "abc", url: "", imageUrl: "https://placeimg.com/400/225/arch" }} isOwner={true} />
                    <GiftListItemView item={{ title: "Item 1", id: "123", details: "abc", url: "", imageUrl: "https://placeimg.com/400/225/arch" }} isOwner={true} />
                    <GiftListItemView item={{ title: "Item 1", id: "123", details: "abc", url: "", imageUrl: "https://placeimg.com/400/225/arch" }} isOwner={false} />
                </div>
            </div>
        </div>
    );
}