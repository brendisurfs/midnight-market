import React from "react";

interface iSubProps {
    pageTitle: string;
    pageInfo: string;
}

const PageSubComponent = ({ pageTitle, pageInfo }: iSubProps) => {
    return (
        <div className="py-2 px-3 bg-gray-200">
            <h2 className="font-bold uppercase text-2xl border-b">{pageTitle}</h2>
            <h3 className="info font-light text-md py-2">{pageInfo}</h3>
        </div>
    );
};

export default PageSubComponent;
