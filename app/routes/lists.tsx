import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getGiftLists } from "~/models/list.server";

type LoaderData = {
  giftLists: Awaited<ReturnType<typeof getGiftLists>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const giftLists = await getGiftLists({ userId });
  return json<LoaderData>({ giftLists: giftLists });
};

export default function ListsPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-primary p-4 text-primary-content">
        <h1 className="text-3xl font-bold">
          <Link to=".">Lists of Gifts</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button type="submit" className="btn btn-secondary">
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full overflow-hidden bg-base-100">
        <div className="overflow-y-auto border-r bg-base-200 sm:w-60">
          <Link to="new" className="block p-4 text-xl text-primary">
            + New List
          </Link>

          <hr />

          <div className="block p-4 text-xl">My lists</div>

          {data.giftLists.length === 0 ? (
            <p className="text-l block py-1 px-4">No lists yet</p>
          ) : (
            <ol>
              {data.giftLists.map((list) => (
                <li key={list.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `text-l block py-1 px-4 ${isActive ? "bg-white" : ""}`
                    }
                    to={list.id}
                  >
                    📃 {list.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )}

          <div className="block border-t p-4 text-xl">Shared lists</div>
        </div>

        <div className="flex-1 overflow-y-scroll p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
