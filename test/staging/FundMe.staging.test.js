const { assert } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
  ? describe.skip
  : describe("test in staging network", async () => {
      let fundMe
      let deployer
      const sendValue = await ethers.utils.parseEther("1")
      it("connect to contract", async () => {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
      })

      it("allow withdraw", async () => {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw()

        const endingFundMeBalance = await ethers.provider.getBalance(
          fundMe.address
        )

        assert.equal(endingFundMeBalance.toString(), 0)
      })
    })
