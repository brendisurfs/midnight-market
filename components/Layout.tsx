import { AppProps } from "next/app";
import Image from "next/image";
import Link from "next/link";
import React, { Component } from "react";
import SideMenuComponent from "./sideMenu";

const Layout = ({ children }: any) => {
    return (
        <div className="h-screen" style={{ background: "#f4f4f4" }}>
            <nav className="flex flex-row items-center justify-between border-b-2 border-gray-400 py-10  bg-black text-gray-200">
                <div className="flex flex-row items-center px-2 ">
                    <div className="px-2">
                        <Image className="invert" src="/moon.svg" width="30" height="30" alt="" />
                    </div>
                    <Link passHref href="/">
                        <a className="brand text-4xl font-semibold uppercase px-2">Midnight + Market</a>
                    </Link>
                </div>
                <SideMenuComponent />
            </nav>

            {children}
        </div>
    );
};

export default Layout;
