// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// nonreentrant, prevents stacking transactions to hack the entry.
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract NFTMarket is ReentrancyGuard {
    using Counters for Counters.Counter;

    // item ids for each individual market item
    Counters.Counter private _itemIds;

    // items sold for each item sold on the marketplace.
    // arrarys are not dynamically linked, so we need to keep up with that systematically.
    Counters.Counter private _itemsSold;

    // addr who is the owner of the contract. So that they can make commission on each item sold.
    // ex: charge a listing fee.
    address payable owner;
    // can consider this as MATIC. We are just using ether rn.
    uint256 listingPrice = 0.025 ether;

    constructor() {
        owner = payable(msg.sender);
    }

    struct MarketItem {
        uint256 itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    // <K, V> pairs give the item id, get the market item.
    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated(
        uint256 indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    // getListingPrice - returns the listing price to the frontend
    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    // Interacting with the contract
    // |
    // v
    // Note: nonReentrant prevents a reentry attack. Called a modifier.
    function createMarketItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) public payable nonReentrant {
        // 1. need a minimum price to list.
        require(price > 0, "Price must be at least 1000 wei");
        // 2. person must send the listing price along with the transaction
        require(
            msg.value == listingPrice,
            "price must be equal to listing price."
        );

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        // making a new MarketItem from struct, in a dynamic way depending on the itemId and msg.sender.
        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            // the owner right now is NOBODY. But it will be some addr once bought.
            payable(address(0)),
            price,
            false
        );
        // once the market item is created, transfer from the creator to the contract.
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    // createMarketSale -
    // |
    // v
    function createMarketSale(address nftContract, uint256 itemId)
        public
        payable
        nonReentrant
    {
        // get a reference to price.
        uint256 price = idToMarketItem[itemId].price;
        // get ref to id.
        uint256 tokenId = idToMarketItem[itemId].tokenId;

        require(
            msg.value == price,
            "please submit the asking price in order to complete the purchase."
        );

        //  if the requirement is met, transfer the value to the seller.
        idToMarketItem[itemId].seller.transfer(msg.value);

        // then, we have to transfer ownership to the buyer.
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToMarketItem[itemId].owner = payable(msg.sender);
        idToMarketItem[itemId].sold = true;
        _itemsSold.increment();

        // residual payments down the line.
        payable(owner).transfer(listingPrice);
    }

    //Different collection sets depending on views.
    // |
    // v
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        // a local item count
        uint256 itemCount = _itemIds.current();
        uint256 unsoldItems = _itemIds.current() - _itemsSold.current();

        // looping over items created, if item empty addr, -> hasnt been sold.
        uint256 currentIdx = 0;
        MarketItem[] memory items = new MarketItem[](unsoldItems);

        for (uint256 i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint256 currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIdx] = currentItem;
                currentIdx += 1;
            }
        }
        // returns the items that we requested.
        return items;
    }

    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();

        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        // loop over the items to keep track of items that align with msg.sender
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint256 currentId = idToMarketItem[i + 1].itemId;
                // get ref to current item.
                MarketItem storage currentItem = idToMarketItem[currentId];
                // then append to arr
                items[currentIndex] = currentItem;
                itemCount += 1;
            }
        }
        return items;
    }

    // return an array of nfts the user has created themselves.
    function fetchItemsCreated() public view returns (MarketItem[] memory) {
        uint256 totalItemCount = _itemIds.current();
        uint256 itemCount = 0;
        uint256 currIdx = 0;
        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].seller == msg.sender) {
                itemCount += 1;
            }
        }
        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
            // check the seller addr, if its equal to the sender, the seller created that item.
            if (idToMarketItem[i + 1].seller == msg.sender) {
                uint256 currentId = idToMarketItem[i + 1].itemId;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currIdx] = currentItem;
                currIdx += 1;
            }
        }
        return items;
    }
}
