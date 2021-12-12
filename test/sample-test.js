const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarket", function () {
    it("should create and execute market sales", async () => {
        // get a reference to that market
        const Market = await ethers.getContractFactory("NFTMarket");
        const nftMarket = await Market.deploy();
        await nftMarket.deployed();

        // get a ref to the addr it was deployed.
        const marketAddr = nftMarket.address;

        const nftContract = await ethers.getContractFactory("NFT");
        const nft = await nftContract.deploy(marketAddr);
        await nft.deployed();
        // get ref to the nft address.
        const nftContractAddr = nft.address;

        // we now need to know the listing price.
        let listingPrice = await nftMarket.getListingPrice();
        listingPrice = listingPrice.toString();

        // need a testing auction price.
        const auctionPrice = ethers.utils.parseUnits("100", "ether");

        // create a few tokens.
        await nft.createToken("https://www.mytokenlocation.com");
        await nft.createToken("https://www.mytokenlocation2.com");

        // list the tokens next.
        await nftMarket.createMarketItem(nftContractAddr, 1, auctionPrice, {
            value: listingPrice,
        });
        await nftMarket.createMarketItem(nftContractAddr, 2, auctionPrice, {
            value: listingPrice,
        });

        // when we run the account, itll give us some test acocunt.
        const [_, buyerAddress] = await ethers.getSigners();

        // connect to the marketplace and sell.
        await nftMarket
            .connect(buyerAddress)
            .createMarketSale(nftContractAddr, 1, { value: auctionPrice });

        // we can query the items as well.
        let items = await nftMarket.fetchMarketItems();

        // we want to map over all the items and update the value of them.
        // lets use items.
        // this should be asyncronous to not mess up the order.
        items = await Promise.all(
            items.map(async (i) => {
                const tokenUri = await nft.tokenURI(i.tokenId);

                let item = {
                    price: i.price.toString(),
                    tokenId: i.tokenId.toString(),
                    seller: i.seller,
                    owner: i.owner,
                    tokenUri,
                };
                return item;
            })
        );

        console.log("items: ", items);
    });
});
