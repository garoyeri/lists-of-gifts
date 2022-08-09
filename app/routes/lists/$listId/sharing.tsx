import { Form, useActionData, useLoaderData } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getGiftListSharing, shareGiftList, unshareGiftList } from "~/models/list.server";
import { requireUserId } from "~/session.server";
import Input from "~/components/input";
import { validateEmail } from "~/utils";

type LoaderData = {
  userId: string;
  permissions: NonNullable<Awaited<ReturnType<typeof getGiftListSharing>>>;
};

type ActionData = {
  fields?: {
    email: string;
  };
  formError?: string;
  errors?: {
    email?: string;
  };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const listId = params.listId;

  if (typeof listId !== "string") throw json("Bad Request", { status: 400 });
  const permissions = await getGiftListSharing({ userId, listId });

  return { userId, permissions };
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const listId = params.listId;

  if (typeof listId !== "string") {
    return badRequest({
      formError: "Something went horribly wrong with the list identifier.",
    });
  }

  const action = form.get("action");
  switch (action) {
    case "add-share":
      const email = form.get("email");
      if (!validateEmail(email)) {
        return badRequest({
          errors: { email: "Must be a valid email address" },
        });
      }

      const addResult = await shareGiftList({ userId, listId, email });
      if (!addResult) {
        return badRequest({
          errors: { email: "Could not share with this email address" },
        });
      }
      break;

    case "delete-share":
      const targetUserId = form.get("targetUserId");
      if (typeof targetUserId !== "string") {
        return badRequest({ formError: "Target User ID was not submitted correctly" });
      }

      const deleteResult = await unshareGiftList({ userId, listId, targetUserId });
      if (!deleteResult) {
        return badRequest({ formError: "Could not delete share"});
      }

      break;

    default:
      break;
  }

  return redirect(`/lists/${listId}/sharing`);
};

export default function ListSharing() {
  const actionData = useActionData() as ActionData;
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <div className="mb-4 flex align-baseline">
        <h3 className="flex-1 text-2xl font-bold">List Sharing</h3>
      </div>

      <Form className="mb-4 flex flex-col gap-4 border-b-2 pb-4" method="post">
        {actionData?.formError && (
          <div className="pt-1 text-error" id="form-error">
            {actionData.formError}
          </div>
        )}
        <Input
          id="email"
          label="Share with email:"
          className="flex-1"
          field={actionData?.fields?.email}
          error={actionData?.errors?.email}
          required={true}
          size={"base"}
        />
        <div className="text-left">
          <button
            type="submit"
            name="action"
            value="add-share"
            className="btn btn-primary btn-md"
          >
            Share
          </button>
        </div>
      </Form>

      <table className="table-zebra table">
        <thead>
          <th>Email Address</th>
          <th>Permission</th>
          <th>Actions</th>
        </thead>
        <tbody>
          {data.permissions
            ?.filter((p) => p.user.id != data.userId)
            .map((p) => (
              <tr key={p.user.id}>
                <td>{p.user.email}</td>
                <td>{p.permission}</td>
                <td>
                  <Form method="delete">
                    <input
                      name="targetUserId"
                      type="hidden"
                      value={p.user.id}
                    />
                    <button
                      type="submit"
                      name="action"
                      value="delete-share"
                      className="btn btn-primary btn-sm"
                    >
                      Delete
                    </button>
                  </Form>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}
