require("@nomiclabs/hardhat-ethers");

const fs = require("fs");

const privateKey = fs.readFileSync(".secret").toString();

// work with infura.
const projectID = "02c51f59c71643019b77aa0e84a9fb23";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    networks: {
        hardhat: {
            chainId: 1337,
        },
        mumbai: {
            url: `https://polygon-mumbai.infura.io/v3/${projectID}`,
            accounts: [privateKey],
        },
        mainnet: {
            url: `https://polygon-mainnet.infura.io/v3/${projectID}`,
            accounts: [privateKey],
        },
    },
    solidity: "0.8.4",
};
