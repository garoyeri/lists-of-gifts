import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
// import { getNoteListItems } from "~/models/note.server";

// type LoaderData = {
//   noteListItems: Awaited<ReturnType<typeof getNoteListItems>>;
// };

// export const loader: LoaderFunction = async ({ request }) => {
//   const userId = await requireUserId(request);
//   const noteListItems = await getNoteListItems({ userId });
//   return json<LoaderData>({ noteListItems });
// };

export default function ListsPage() {
  //const data = useLoaderData() as LoaderData;
  const user = useUser();

  return (
    <div className="flex h-full min-h-screen flex-col">
      <header className="flex items-center justify-between bg-slate-800 p-4 text-white">
        <h1 className="text-3xl font-bold">
          <Link to=".">Lists of Gifts</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button
            type="submit"
            className="rounded bg-slate-600 py-2 px-4 text-blue-100 hover:bg-blue-500 active:bg-blue-600"
          >
            Logout
          </button>
        </Form>
      </header>

      <main className="flex h-full bg-white">
        <div className="h-full w-80 border-r bg-gray-50">
          <Link to="new" className="block p-4 text-xl text-blue-500">
            + New List
          </Link>

          <hr />
          
          <div className="block p-4 text-xl">My lists</div>

          <ol>
            <li className="block py-1 px-4 text-l">List 1</li>
            <li className="block py-1 px-4 text-l">List 2</li>
            <li className="block py-1 px-4 text-l">List 3</li>
          </ol>

          <div className="block border-t p-4 text-xl">Shared lists</div>

          {/* {data.noteListItems.length === 0 ? (
            <p className="p-4">No lists yet</p>
          ) : (
            <ol>
              {data.noteListItems.map((note) => (
                <li key={note.id}>
                  <NavLink
                    className={({ isActive }) =>
                      `block border-b p-4 text-xl ${isActive ? "bg-white" : ""}`
                    }
                    to={note.id}
                  >
                    📝 {note.title}
                  </NavLink>
                </li>
              ))}
            </ol>
          )} */}
        </div>

        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
