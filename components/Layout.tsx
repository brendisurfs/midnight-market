import { AppProps } from "next/app";
import Link from "next/link";
import React, { Component } from "react";

const Layout = ({ children }: any) => {
    return (
        <>
            <nav className="border-b p-6">
                <h2 className="brand text-4xl font-bold">This is a Marketplace</h2>
                <div>
                    <Link href="/">
                        <a className="mr-6 text-indigo-600">Home</a>
                    </Link>
                    <Link href="/create">
                        <a className="mr-6 text-indigo-600">Create</a>
                    </Link>
                    <Link href="/my-assets">
                        <a className="mr-6 text-indigo-600">My Assets</a>
                    </Link>
                    <Link href="/my-assets">
                        <a className="mr-6 text-indigo-600">Creator Dashboard</a>
                    </Link>
                </div>
            </nav>

            {children}
        </>
    );
};

export default Layout;
