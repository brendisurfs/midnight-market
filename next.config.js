/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    env: {
        marketAddr: process.env.MARKET_ADDR,
        nftAddr: process.env.NFT_ADDR,
    },
    images: {
        domains: ["ipfs.infura.io"],
    },
};
