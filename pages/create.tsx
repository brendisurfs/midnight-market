import Layout from "../components/Layout";
import { create as ipfsCreate, Options } from "ipfs-http-client";
import { useRouter } from "next/router";
import React, { ChangeEvent, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

import { iNftType } from "./index";

interface formInputType {
    name: string;
    price: string;
    description: string;
}

// NFT refs
import { nftaddr, marketaddr } from "../.config.js";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTmarket.sol/NFTMarket.json";

const ipfsOptions: Options = {
    apiPath: "https://ipfs.infura.io:5001/api/v0",
};
const client = ipfsCreate(ipfsOptions);

const create = () => {
    const router = useRouter();
    const [fileUrl, setFileUrl] = useState<string>("");
    const [formInput, updateFormInput] = useState<any>();

    // onChange - handles the change to the file upload.
    // |
    // v
    async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
        // check if there are any files, if not no need to continue.
        if (!e.currentTarget.files) return;
        const inputFile = e.currentTarget.files[0];

        try {
            let added = await client.add(inputFile, {
                progress: (prog) => console.log(`received: ${prog}`),
            });
            let uploadedURL = `https://ipfs.infura.io/ipfs/${added.path}`;
            setFileUrl(uploadedURL);
        } catch (error) {
            console.log(error);
        }
    }

    // createItem - lists the item on the market.
    async function createItem() {
        // let formName = formInput?.name;
        // let formDesc = formInput?.description;
        // let formPrice = formInput?.price;
        // if (!formName || !formPrice || !formDesc || !fileUrl) return;

        const { name, description, price } = formInput;
        if (!name || !price || !description || !fileUrl) return;

        let data = JSON.stringify({
            name,
            description,
            image: fileUrl,
        });

        try {
            let added = await client.add(data);
            let addedURL = `https://ipfs.infura.io/ipfs/${added.path}`;
            createSale(addedURL);
        } catch (error) {
            console.log("error uploading file: ", error);
        }
    }

    async function createSale(url: string) {
        // instance of the web3modal.
        let web3modal = new Web3Modal();
        let conn = await web3modal.connect();
        let provider = new ethers.providers.Web3Provider(conn);
        let signer = provider.getSigner();

        // create a new contract addr.
        let contract = new ethers.Contract(nftaddr, NFT.abi, signer);
        let transaction = await contract.createToken(url);
        let tx = await transaction.wait();

        let events = tx.events[0];
        // we want the third value from the args.
        let value = events.args[2];
        // need to convert it to a usable number.
        let tokenId = value.toNumber();

        const price = ethers.utils.parseUnits(formInput!.price, "ether");
        contract = new ethers.Contract(marketaddr, Market.abi, signer);

        let listingPrice = await contract.getListingPrice();
        listingPrice = listingPrice.toString();

        // create the transaction, extract data from wallet.
        transaction = await contract.createMarketItem(nftaddr, tokenId, price, {
            value: listingPrice,
        });

        await transaction.wait();

        // route the user back to the main page to see the nft.
        router.push("/");
    }

    return (
        <Layout>
            <div className="flex justify-center">
                <div className=" flex flex-col pb-12 w-1/2">
                    <input
                        type="text"
                        placeholder="Asset Name"
                        className="mt-8 border rounded p-4"
                        onChange={(e) =>
                            updateFormInput({
                                ...formInput,
                                name: e.target.value,
                            })
                        }
                    />
                    <textarea
                        placeholder="Asset Name"
                        className="mt-8 border rounded p-4"
                        onChange={(e) =>
                            updateFormInput({
                                ...formInput,
                                description: e.target.value,
                            })
                        }
                    />
                    <input
                        placeholder="Asset Price"
                        className="mt-8 border rounded p-4"
                        onChange={(e) =>
                            updateFormInput({
                                ...formInput,
                                price: e.target.value,
                            })
                        }
                    />
                    <input
                        type="file"
                        placeholder="Asset File"
                        name="Asset"
                        className="my-4 "
                        onChange={onChange}
                    />
                    {/* Preview file here */}
                    {fileUrl && (
                        <img
                            className="rounded mt-4"
                            width="350"
                            src={fileUrl}
                            alt=""
                        />
                    )}
                    <button
                        onClick={createItem}
                        className="font-bold mt-4 bg-indigo-500 text-white p-4 shadow-lg"
                    >
                        Create Asset
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default create;
