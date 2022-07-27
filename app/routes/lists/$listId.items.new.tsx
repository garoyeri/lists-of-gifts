import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import Input from "~/components/input";
import { requireUserId } from "~/session.server";
import { validateUrl } from "~/utils";

type ActionData = {
    formError?: string;
    errors?: {
        title?: string;
        detail?: string;
        url?: string;
        imageUrl?: string;
    };
    fields?: {
        title: string;
        detail: string;
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
    const detail = form.get("detail");

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
        detail: typeof detail === "string" && detail.length >= 8192 ? "Too much detail, dumb it down to 8192 characters please." : undefined,
    };

    const fields = {
        title,
        url: url as string,
        imageUrl: imageUrl as string,
        detail: detail as string,
    };

    if (Object.values(errors).some(Boolean)) {
        return badRequest({ errors, fields });
    }

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
                    <label className="label" htmlFor="detail">
                        <span className="label-text text-lg">Details: </span>
                    </label>
                    <textarea name="detail" id="detail" rows={4} className="textarea textarea-bordered"
                        aria-invalid={actionData?.errors?.detail ? true : undefined}
                        aria-errormessage={
                            actionData?.errors?.detail ? "detail-error" : undefined}
                    ></textarea>
                    {actionData?.errors?.detail && (
                        <div className="pt-1 text-error" id="detail-error">
                            {actionData.errors.detail}
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