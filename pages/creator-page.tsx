import React from "react";
import Layout from "../components/Layout";
import PageSubComponent from "../components/PageSubtitle";

const CreatorPage = () => {
    return (
        <Layout>
            <PageSubComponent
                pageTitle="Creator Dashboard"
                pageInfo="this is the creator page, where you can see your work and what you have bought"
            />
        </Layout>
    );
};

export default CreatorPage;
