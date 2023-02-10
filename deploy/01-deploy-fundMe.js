const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../scripts/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { log, deploy, get } = deployments
  const { deployer } = await getNamedAccounts()
  console.log(deployer, " deployer ")

  const { name } = network
  const { chainId } = network.config
  let ethUsdPriceFeed

  if (developmentChains.includes(name)) {
    const ethUsdAggregator = await get("MockV3Aggregator")
    ethUsdPriceFeed = ethUsdAggregator.address
  } else {
    ethUsdPriceFeed = networkConfig[chainId].ethUsdPriceFeed
  }

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args: [ethUsdPriceFeed],
    log: true,
    waitConfirmations: network.config.blockConfirmation || 1,
  })

  if (!developmentChains.includes(name) && process.env.ETHERSCAN_API_KEY) {
    await verify(fundMe.address, [ethUsdPriceFeed])
  }
  log("FundMe deployed ______________")
}

module.exports.tags = ["all", "fundme"]
