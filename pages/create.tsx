import Layout from "../components/Layout";
import { create as ipfsCreate } from "ipfs-http-client";
import { useRouter } from "next/router";
import React, { ChangeEvent, useState } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

interface formInputType {
    price: string;
    name: string;
    description: string;
}

let formValue: formInputType;

// NFT refs
import { nftaddr, marketaddr } from "../.config.js";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import Market from "../artifacts/contracts/NFTmarket.sol/NFTMarket.json";

const client = ipfsCreate({
    host: "ipfs.infura.io",
    port: 5001,
    protocol: "https",
    headers: {
        authorization: "auth",
    },
});

const CreatePage = () => {
    const router = useRouter();
    const [fileUrl, setFileUrl] = useState("");
    const [formInput, updateFormInput] = useState({ ...formValue });
    const [loading, setLoading] = useState(0);

    // onChange - handles the change to the file upload.
    // |
    // v
    async function onChange(e: ChangeEvent<HTMLInputElement>) {
        // check if there are any files, if not no need to continue.
        if (!e.target.files) {
            console.log("no files found");
            return;
        }
        const inputFile = e.target.files[0];
        try {
            let added = await client.add(inputFile, {
                progress: (prog) => {
                    setLoading(Math.ceil((prog / inputFile.size) * 100));
                },
            });
            let uploadedURL = `https://ipfs.infura.io/ipfs/${added.path}`;
            setFileUrl(uploadedURL);
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

        /**Create the Item */
        let contract = new ethers.Contract(nftaddr, NFT.abi, signer);
        let transaction = await contract.createToken(url);
        let tx = await transaction.wait();

        let events = tx.events[0];
        // we want the third value from the args.
        let value = events.args[2];
        let tokenId = value.toNumber();
        const price = ethers.utils.parseUnits(String(formInput.price), "ether");

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
    // createItem - lists the item on the market.
    async function createMarket() {
        const { name, description, price } = formInput;
        if (!name || !price || !description || !fileUrl) return;

        // parse the data.
        let data = JSON.stringify({
            name,
            description,
            image: fileUrl,
        });

        try {
            console.log("adding client data");
            let added = await client.add(data);
            let addedURL = `https://ipfs.infura.io/ipfs/${added.path}`;
            // BUG
            console.log("added url!");

            createSale(addedURL);
        } catch (error) {
            console.log("error uploading file: ", error);
        }
    }

    return (
        <Layout>
            <div className="flex justify-center">
                <div className=" flex flex-col pb-12 w-1/2">
                    <input
                        type="text"
                        placeholder="Asset Name"
                        className="mt-8 border-b rounded p-4"
                        onChange={(e) =>
                            updateFormInput({
                                ...formInput,
                                name: e.target.value,
                            })
                        }
                    />
                    <textarea
                        placeholder="Asset Description"
                        className="mt-8 border-b rounded p-4"
                        onChange={(e) =>
                            updateFormInput({
                                ...formInput,
                                description: e.target.value,
                            })
                        }
                    />
                    <div className="mt-8 border-b flex flex-row items-center justify-between">
                        <input
                            type="number"
                            placeholder="Asset Price"
                            className="rounded p-4 w-full"
                            onChange={(e) =>
                                updateFormInput({
                                    ...formInput,
                                    price: e.target.value,
                                })
                            }
                        />
                        <h3 className="text-right p-2">ETH</h3>
                    </div>
                    {/* FILE SECTION */}
                    <input
                        type="file"
                        placeholder="Asset File"
                        name="Asset"
                        className="my-4 "
                        onChange={onChange}
                    />
                    {/* loading bar */}
                    <div className="progress h-3 relative  rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gray-200 absolute"></div>
                        <div
                            id="bar"
                            className="transition-all ease-out duration-1000 h-full bg-green-500 relative w-0"
                            style={{ width: `${loading}%` }}
                        ></div>
                    </div>
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
                        onClick={createMarket}
                        className="font-bold mt-4 bg-indigo-500 text-white p-4 shadow-lg"
                    >
                        Create Asset
                    </button>
                </div>
            </div>
        </Layout>
    );
};

export default CreatePage;
