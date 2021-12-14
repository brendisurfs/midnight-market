/**
 * TODO: set global state for nav open with context.
 * Want the bg to dim when open.
 */
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";

const SideMenuComponent = () => {
    const [navOpen, setNavOpen] = useState<boolean>(false);

    return (
        <div className="px-6">
            <button onClick={() => setNavOpen(!navOpen)}>
                {navOpen ? (
                    <Image width="32" height="32" src="/close.svg" alt="menu closed" className="invert" />
                ) : (
                    <Image src="/menu.svg" width="32" height="32" className="invert" alt="menu"></Image>
                )}
            </button>
            <nav className="fixed -translate-x-36 w-6/12">
                <div className={navOpen ? "links w-full flex flex-col bg-black h-screen" : "hidden"}>
                    <Link href="/">
                        <a className="border border-gray-800 p-4 hover:bg-gray-900">Home</a>
                    </Link>
                    <Link href="/create">
                        <a className="border border-gray-800 p-4 hover:bg-gray-900 ">Create</a>
                    </Link>
                    <Link href="/my-assets">
                        <a className="border border-gray-800 p-4 hover:bg-gray-900">My Assets</a>
                    </Link>
                    <Link href="/creator-page">
                        <a className=" border border-gray-800 p-4 hover:bg-gray-900">Creator Dashboard</a>
                    </Link>
                </div>
            </nav>
        </div>
    );
};

export default SideMenuComponent;
