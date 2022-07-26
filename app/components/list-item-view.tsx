import type { GiftListItem } from "@prisma/client"

export default function GiftListItemView({
    item,
    isOwner,
} : {
    item: Pick<GiftListItem, "title" | "details" | "id" | "url" | "imageUrl">;
    isOwner: boolean;
}) {
    return (
        <div className="bg-secondary w-full h-60">
            <h4 className="text-lg">{item.title}</h4>
            <article className="prose">
                {item.details}
            </article>
        </div>
    )
}