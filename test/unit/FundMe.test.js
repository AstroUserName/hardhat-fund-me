const { assert, expect } = require("chai")
const { deployments, getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async () => {
      let fundMe
      let deployer
      let mockV3Aggregator
      const sendValue = ethers.utils.parseEther("1")

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])

        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })

      describe("constructor", async () => {
        it("mockV3Aggregator address", async () => {
          const response = await fundMe.getPriceFeed()
          assert.equal(mockV3Aggregator.address, response)
        })
      })

      describe("fund", async () => {
        it("falls if you dont send enought eth", async () => {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          )
        })

        it("updated the amount funded data structure", async () => {
          await fundMe.fund({ value: sendValue })
          const expectedValue = await fundMe.getAddressToAmountFunded(deployer)
          assert.equal(expectedValue.toString(), sendValue.toString())
        })

        it("add funder to array of funders", async () => {
          await fundMe.fund({ value: sendValue })
          const funder = await fundMe.getFunder(0)
          assert.equal(deployer, funder)
        })
      })

      describe("withdraw", async () => {
        beforeEach(async () => {
          await fundMe.fund({ value: sendValue })
        })

        it("check withdraw with deployer only", async () => {
          // Arrange
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployer = await fundMe.provider.getBalance(deployer)

          //Act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Assert
          assert.equal(endingFundMeBalance.toString(), "0")
          assert.equal(
            startingFundMeBalance.add(startingDeployer).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })

        it("check withdraw with multiple accounts", async () => {
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }

          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployer = await fundMe.provider.getBalance(deployer)

          //Act
          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          //Assert
          assert.equal(endingFundMeBalance.toString(), "0")
          assert.equal(
            startingFundMeBalance.add(startingDeployer).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )

          await expect(fundMe.getFunder(0)).to.be.reverted
          for (let i = 1; i < 6; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            )
          }
        })

        it("should revert if not owner call withdraw", async () => {
          const accounts = await ethers.getSigners()
          const fundMeConnectedAccount = await fundMe.connect(accounts[1])

          await expect(fundMeConnectedAccount.withdraw()).to.be.revertedWith(
            "FundMe__NotOwner"
          )
        })
      })
    })
