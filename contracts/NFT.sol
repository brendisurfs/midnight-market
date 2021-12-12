// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;

    // counting private ids that are interacting with the auctionhouse.
    Counters.Counter private _tokenIds;

    // address of the marketplace that we want the nft to interact with.
    address contractAddr;

    constructor(address marketplaceAddr) ERC721("Metaverse Tokens", "METT") {
        contractAddr = marketplaceAddr;
    }

    // createToken - creates a token.
    function createToken(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        // next, mint the token
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddr, true);

        // return
        return newItemId;
    }
}
