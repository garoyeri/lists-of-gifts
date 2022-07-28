import type { ActionFunction } from "@remix-run/node";
import { redirect, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { createGiftList } from "~/models/list.server";
import { requireUserId } from "~/session.server";

type ActionData = {
  errors?: {
    title?: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const title = formData.get("title");

  if (typeof title !== "string" || title.length === 0) {
    return json<ActionData>(
      { errors: { title: "Title is required" } },
      { status: 400 }
    );
  }

  const list = await createGiftList({ title, userId });
  return redirect(`/lists/${list.id}`);
};

export default function NewListPage() {
  const actionData = useActionData() as ActionData;
  return (
    <Form method="post" className="flex w-full flex-col gap-8">
      <div className="form-control">
        <label className="label" htmlFor="title">
          <span className="label-text text-lg">Title: </span>
        </label>
        <input
          name="title"
          id="title"
          className="input input-bordered input-lg"
          aria-invalid={actionData?.errors?.title ? true : undefined}
          aria-errormessage={
            actionData?.errors?.title ? "title-error" : undefined
          }
        />
        {actionData?.errors?.title && (
          <div className="pt-1 text-error" id="title-error">
            {actionData.errors.title}
          </div>
        )}
      </div>

      <div className="text-left">
        <button type="submit" className="btn btn-primary btn-lg">
          Save
        </button>
      </div>
    </Form>
  );
}
