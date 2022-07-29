import { Form, useActionData, useLoaderData } from "@remix-run/react";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { getGiftListSharing } from "~/models/list.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  permissions: NonNullable<Awaited<ReturnType<typeof getGiftListSharing>>>
};

type ActionData = {
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const listId = params.listId;

  if (typeof listId !== "string") throw json("Bad Request", { status: 400 });

  return await getGiftListSharing({ userId, listId });
}

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const listId = params.listId;
  
  const form = await request.formData();
  const targetUserId = form.get("userId");

  
};

export default function ListSharing() {
  const actionData = useActionData();
  const data = useLoaderData<LoaderData>();

  return (
    <>
      <div className="mb-4 flex align-baseline">
        <h3 className="flex-1 text-2xl font-bold">List Sharing</h3>
      </div>
      <table className="table table-zebra">
        <thead>
          <th>Email Address</th>
          <th>Permission</th>
          <th>Actions</th>
        </thead>
        <tbody>
          <tr>
            <td>me@whatever.com</td>
            <td>VIEWER</td>
            <td>
              <Form method="delete">
                <input id="email" type="hidden" value="me@whatever.com" />
                <button type="submit" className="btn btn-primary btn-sm">
                  Delete
                </button>
              </Form>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}
