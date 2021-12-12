import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import type { NextPage } from "next";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";

import { nftaddr, marketaddr } from "../.config.js";

export interface iNftType {
    price: string;
    tokenId: number;
    seller: string;
    owner: string;
    image: string;
    name: string;
    description: string;
}

// we will need a ref to our market addr and wallet addr.
// we will also need our ABIs. This is the json rep of our contract.
// |
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTmarket.sol/NFTMarket.json";

const Home: NextPage = () => {
    const [nfts, setNFTs] = useState<iNftType[]>([]);
    const [loadingState, setLoadingState] = useState("not-loaded");

    useEffect(() => {
        loadNFTs();
    }, []);

    async function loadNFTs() {
        const provider = new ethers.providers.JsonRpcProvider();
        const tokenContract = new ethers.Contract(nftaddr, NFT.abi, provider);
        const marketContract = new ethers.Contract(marketaddr, Market.abi, provider);
        const data = await marketContract.fetchMarketItems();

        // map over items, reset them.
        const items = await Promise.all(
            data.map(async (i: iNftType) => {
                const tokenUri: string = await tokenContract.tokenURI(i.tokenId);

                const meta = await axios.get(tokenUri);

                let price = ethers.utils.formatUnits(i.price, "ether");

                // structure our data and reseting it to our frontend.
                let item = {
                    price,
                    tokenId: i.tokenId,
                    seller: i.seller,
                    owner: i.owner,
                    image: meta.data.image,
                    name: meta.data.name,
                    description: meta.data.description,
                };
                console.log(item);
                return item;
            })
        );
        setLoadingState("loaded");
        setNFTs(items);
    }

    async function buyNFT(nft: iNftType) {
        const web3Modal = new Web3Modal();
        const conn = await web3Modal.connect();
        const provider = new ethers.providers.Web3Provider(conn);
        // we need a signer for the purchase.
        const signer = provider.getSigner();
        const contract = new ethers.Contract(marketaddr, Market.abi, signer);
        // next need a ref to the price.
        const price = ethers.utils.parseUnits(String(nft.price), "ether");
        const transaction = await contract.createMarketSale(nftaddr, nft.tokenId, {
            value: price,
        });
        // we want to wait maybe to reload the page.
        await transaction.wait();
        loadNFTs();
    }

    if (loadingState == "loaded" && !nfts.length)
        return (
            <Layout>
                <h1 className="px-20 py-10 text-3xl">no items in marketplace</h1>
            </Layout>
        );
    return (
        <>
            <Layout>
                <div className=" content flex justify-center">
                    <div className="px-4" style={{ maxWidth: "1600px" }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                            {/* nfts map */}
                            {nfts.map((nft: iNftType) => (
                                <div key={nft.name} className="border shadow rounded-xl overflow-hidden">
                                    <img src={nft.image} alt="nft image" />
                                    <div className="p-4">
                                        <div style={{ height: "64px" }} className="text-2xl font-semibold">
                                            {nft.name}
                                        </div>
                                        <div
                                            className="desc-section"
                                            style={{
                                                height: "70px",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <p className="text-gray-400">{nft.description}</p>
                                        </div>
                                    </div>
                                    <div className="price-section p-4 bg-black ">
                                        <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                                        <button
                                            onClick={() => buyNFT(nft)}
                                            className="w-full bg-indigo-500 text-white font-bold py-2 px-12 rounded "
                                        >
                                            Buy NFT
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default Home;
