import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import Input from "~/components/input";
import { createGiftListItem } from "~/models/list.server";
import { requireUserId } from "~/session.server";
import { validateUrl } from "~/utils";

type ActionData = {
    formError?: string;
    errors?: {
        title?: string;
        details?: string;
        url?: string;
        imageUrl?: string;
    };
    fields?: {
        title: string;
        details: string;
        url: string;
        imageUrl: string;
    }
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request, params }) => {
    const userId = await requireUserId(request);
    const form = await request.formData();

    const title = form.get("title");
    const url = form.get("url");
    const imageUrl = form.get("imageUrl");
    const details = form.get("details");

    const listId = params.listId;

    if (typeof title !== "string" ||
        typeof listId !== "string") {
        return badRequest({ formError: "Form not submitted correctly" });
    }

    const cleanUrl = validateUrl(url);
    const cleanImageUrl = validateUrl(imageUrl);

    const errors = {
        title: title.length < 1 ? "Cannot be blank" : undefined,
        url: url && typeof cleanUrl === "undefined" ? "Must be a valid URL" : undefined,
        imageUrl: imageUrl && typeof cleanImageUrl === "undefined" ? "Must be a valid URL" : undefined,
        details: typeof details === "string" && details.length >= 8192 ? "Too much detail, dumb it down to 8192 characters please." : undefined,
    };

    const fields = {
        title,
        url: url as string,
        imageUrl: imageUrl as string,
        details: details as string,
    };

    if (Object.values(errors).some(Boolean)) {
        return badRequest({ errors, fields });
    }

    await createGiftListItem({ userId, listId, item: {
        title,
        url: cleanUrl?.toString() ?? null,
        imageUrl: cleanImageUrl?.toString() ?? null,
        details: (details as string) ?? null,
    }})

    return redirect(`/lists/${listId}`);
};

export default function NewListItem() {
    const actionData = useActionData() as ActionData;
    return (
        <>
            <div className="flex align-baseline mb-4">
                <h3 className="text-2xl font-bold w-full">New Gift List Item</h3>
            </div>
            {actionData?.formError && (
                <div className="pt-1 text-error" id="form-error">
                    {actionData.formError}
                </div>
            )}
            <Form
                method="post"
                className="flex flex-col gap-8 w-full">

                <Input
                    id="title" label="Item Summary:"
                    error={actionData?.errors?.title}
                    field={actionData?.fields?.title}
                    required={true} />

                <Input
                    id="url" label="Item Link:"
                    error={actionData?.errors?.url}
                    field={actionData?.fields?.url} />

                <Input
                    id="imageUrl" label="Item Image Link:"
                    error={actionData?.errors?.imageUrl}
                    field={actionData?.fields?.imageUrl} />


                <div className="form-control">
                    <label className="label" htmlFor="details">
                        <span className="label-text text-lg">Details: </span>
                    </label>
                    <textarea name="details" id="details" rows={4} className="textarea textarea-bordered"
                        aria-invalid={actionData?.errors?.details ? true : undefined}
                        aria-errormessage={
                            actionData?.errors?.details ? "details-error" : undefined}
                    ></textarea>
                    {actionData?.errors?.details && (
                        <div className="pt-1 text-error" id="details-error">
                            {actionData.errors.details}
                        </div>
                    )}
                </div>

                <div className="text-left">
                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                    >
                        Save
                    </button>
                </div>
            </Form>

        </>
    );
}