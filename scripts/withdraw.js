const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
  let transactionResponse
  const { deployer } = await getNamedAccounts()
  const fundMe = await ethers.getContract("FundMe", deployer)

  transactionResponse = await fundMe.withdraw()
  await transactionResponse.wait(1)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
