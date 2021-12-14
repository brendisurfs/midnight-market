import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import type { NextPage } from "next";
import Web3Modal from "web3modal";
import { ethers } from "ethers";
import axios from "axios";

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
const nftaddr = process.env.nftAddr!;
const marketaddr = process.env.marketAddr!;
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTmarket.sol/NFTMarket.json";
import Image from "next/image";
import Link from "next/link";
import PageSubComponent from "../components/PageSubtitle";

const Home: NextPage = () => {
    // NFT states.
    const [nfts, setNFTs] = useState<iNftType[]>([]);
    const [loadingState, setLoadingState] = useState("not-loaded");

    // load NFTs when loading the page.
    useEffect(() => {
        loadNFTs();
    }, []);

    // loadNFTs -> loads all the nfts on the marketplace.
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
                return item;
            })
        );
        setLoadingState("loaded");
        setNFTs(items);
    }

    // buyNFT - executes instructions to connect to the web3modal (metamask), and add the nft to the wallet.
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

    // ------------------------TSX--------------------------------------------------------------------------------
    return (
        <>
            <Layout>
                <PageSubComponent pageTitle="Market" pageInfo="This is going to be very, very interesting." />
                {loadingState === "loaded" && !nfts.length ? (
                    <div className=" p-10  flex items-center justify-center flex-col">
                        <p className="font-semibold text-3xl mb-4">no items in marketplace</p>
                        <div className=" flex flex-row ">
                            but you can{" "}
                            <Link passHref href="/create">
                                <p className="text-blue-600 mx-2 border-b"> add some!</p>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className=" content flex justify-center">
                        <div className="px-4" style={{ maxWidth: "1600px" }}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                                {/* nfts map */}
                                {nfts.map((nft: iNftType) => (
                                    <div key={nft.name} className="border shadow rounded-xl overflow-hidden">
                                        <Image height={256} width={256} src={nft.image} alt="nft image" />
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
                )}
            </Layout>
        </>
    );
};

export default Home;
