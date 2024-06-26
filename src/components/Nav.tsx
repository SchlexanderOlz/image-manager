"use client";

import { ComponentContext } from "@/context/MainContent";
import { useContext } from "react";
import ImageUploadDialog from "./upload/ImageUploadDialog";
import Home from "./Home";
import Gallery from "./gallery/Gallery";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Nav() {
  const { setComponent } = useContext(ComponentContext)!;
  const router = useRouter();

  const logout = async () => {
    let res = await signOut({ redirect: false });

    if (res) {
      router.push("/login");
    }
  };

  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li>
              <a onClick={() => setComponent(<ImageUploadDialog />)}>
                Upload a new image
              </a>
            </li>
            <li>
              <a onClick={() => setComponent(<Gallery />)}>Gallery</a>
            </li>
            <li>
              <a onClick={() => logout()}>Logout</a>
            </li>
          </ul>
        </div>
        <a
          onClick={() => setComponent(<Home />)}
          className="btn btn-ghost text-xl"
        >
          Image-Manager
        </a>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a onClick={() => setComponent(<ImageUploadDialog />)}>
              Upload a new image
            </a>
          </li>
          <li>
            <a onClick={() => setComponent(<Gallery />)}>Gallery</a>
          </li>
          <li>
            <a onClick={() => logout()}>Logout</a>
          </li>
        </ul>
      </div>
      <div className="navbar-end">
        <div
          tabIndex={0}
          role="button"
          className="btn btn-ghost btn-circle avatar"
        >
          <div className="w-10 rounded-full">
            <img
              alt="Tailwind CSS Navbar component"
              src="https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
