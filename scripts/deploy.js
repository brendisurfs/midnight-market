const hre = require("hardhat");

async function main() {
    const NFTMarketConfig = await hre.ethers.getContractFactory("NFTMarket");
    const nftMarket = await NFTMarketConfig.deploy();
    await nftMarket.deployed();

    console.log("nft market deployed to: ", nftMarket.address);

    // deploy nft

    const NFTConfig = await hre.ethers.getContractFactory("NFT");
    const nft = await NFTConfig.deploy(nftMarket.address);
    await nft.deployed();

    console.log("nft deployed to: ", nft.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
