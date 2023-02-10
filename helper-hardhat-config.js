const networkConfig = {
  5: {
    name: "goeril",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
}

const developmentChains = ["localhost", "hardhat"]

const DECIMALS = 8
const INITIAL_ANSWER = 2000 * 1e8

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
}
