import React, { ChangeEvent, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

// NFT info
import { nftaddr, marketaddr } from "../.config.js";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTmarket.sol/NFTMarket.json";

import Layout from "../components/Layout";
import { useEffect } from "react";
import { iNftType } from "./index";
import axios from "axios";
import Image from "next/image";

const MyAssets = () => {
    const [nfts, setNFTs] = useState<any[]>([]);
    const [loading, setLoading] = useState("not-loaded");
    useEffect(() => {
        loadNFTs();
    }, []);

    async function loadNFTs() {
        let web3modal = new Web3Modal();
        let conn = await web3modal.connect();
        let provider = new ethers.providers.Web3Provider(conn);
        let signer = provider.getSigner();

        let marketContract = new ethers.Contract(marketaddr, Market.abi, signer);
        let tokenContract = new ethers.Contract(nftaddr, NFT.abi, provider);
        let data = await marketContract.fetchMyNFTs();

        let items = await Promise.all(
            data.map(async (i: iNftType) => {
                let tokenURI = await tokenContract.tokenURI(i.tokenId);
                let metadata = await axios.get(tokenURI);
                let price = ethers.utils.formatUnits(i.price.toString(), "ether");

                let item = {
                    price,
                    tokenId: i.tokenId,
                    seller: i.seller,
                    owner: i.owner,
                    image: metadata.data.image,
                };
                return item;
            })
        );

        setLoading("loaded");
        setNFTs(items);
        console.log(nfts);
    }

    return (
        <Layout>
            {loading === "loaded" && !nfts.length ? (
                <div>no nfts.</div>
            ) : (
                <div className="flex justify-center px-2" style={{ maxWidth: "1600px" }}>
                    {nfts.map((nft: iNftType) => (
                        <div key={nft.price} className="border shadow overflow-hidden">
                            <Image width="256" height="256" src={nft.image} alt="nft image" />
                            <div className="price-section p-4 bg-black text-white flex justify-around">
                                <p className="text-xl font-thin text-center  justify-between "> Price :</p>
                                <p className="font-semibold text-lg border-b">{nft.price} ETH</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Layout>
    );
};

export default MyAssets;
