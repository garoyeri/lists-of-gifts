import type { GiftListItem } from "@prisma/client"
import { Link } from "@remix-run/react";

export default function GiftListItemView({
    item,
    isOwner,
}: {
    item: Pick<GiftListItem, "title" | "details" | "id" | "url" | "imageUrl">;
    isOwner: boolean;
}) {
    return (
        <div className="card card-compact bg-base-100 shadow-xl">
            {item.imageUrl ? (
                <figure><img src={item.imageUrl} alt={item.title} /></figure>
            ) : undefined}
            <div className="card-body">
                <h2 className="card-title">{item.title}</h2>
                <p>{item.details}</p>
                <div className="card-actions justify-end">
                    {isOwner ? (
                        <Link to={`edit/${item.id}`} className="btn btn-secondary">Edit</Link>
                    ) : null}
                    {item.url ? (
                        <a href={item.url} className="btn btn-primary">Buy Now</a>
                    ) : undefined}
                </div>
            </div>
        </div>
    )
}