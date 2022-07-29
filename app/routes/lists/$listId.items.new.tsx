import type { ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import Input from "~/components/input";
import InputTextarea from "~/components/input-textarea";
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
  };
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

  if (typeof title !== "string" || typeof listId !== "string") {
    return badRequest({ formError: "Form not submitted correctly" });
  }

  const cleanUrl = validateUrl(url);
  const cleanImageUrl = validateUrl(imageUrl);

  const errors = {
    title: title.length < 1 ? "Cannot be blank" : undefined,
    url:
      url && typeof cleanUrl === "undefined"
        ? "Must be a valid URL"
        : undefined,
    imageUrl:
      imageUrl && typeof cleanImageUrl === "undefined"
        ? "Must be a valid URL"
        : undefined,
    details:
      typeof details === "string" && details.length >= 8192
        ? "Too much detail, dumb it down to 8192 characters please."
        : undefined,
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

  const result = await createGiftListItem({
    userId,
    listId,
    item: {
      title,
      url: cleanUrl?.toString() ?? null,
      imageUrl: cleanImageUrl?.toString() ?? null,
      details: (details as string) ?? null,
    },
  });
  if (!result) {
    return badRequest({ formError: "You're not allowed to update this list" });
  }

  return redirect(`/lists/${listId}`);
};

export default function NewListItem() {
  const actionData = useActionData() as ActionData;
  return (
    <>
      <div className="mb-4 flex align-baseline">
        <h3 className="w-full text-2xl font-bold">New Gift List Item</h3>
      </div>
      {actionData?.formError && (
        <div className="pt-1 text-error" id="form-error">
          {actionData.formError}
        </div>
      )}
      <Form method="post" className="flex w-full flex-col gap-8">
        <Input
          id="title"
          label="Item Summary:"
          error={actionData?.errors?.title}
          field={actionData?.fields?.title}
          required={true}
        />

        <Input
          id="url"
          label="Item Link:"
          error={actionData?.errors?.url}
          field={actionData?.fields?.url}
        />

        <Input
          id="imageUrl"
          label="Item Image Link:"
          error={actionData?.errors?.imageUrl}
          field={actionData?.fields?.imageUrl}
        />

        <InputTextarea
          id="details"
          label="Details:"
          error={actionData?.errors?.details}
          field={actionData?.fields?.details}
        />

        <div className="text-left">
          <button type="submit" className="btn btn-primary btn-lg">
            Save
          </button>
        </div>
      </Form>
    </>
  );
}
