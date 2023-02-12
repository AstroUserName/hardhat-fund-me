import { ethers } from "./ethers-5.1.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const ethInput = document.getElementById("ethInput")

const connectBtn = document.getElementById("connect")
connectBtn.onclick = connect

const fundBtn = document.getElementById("fund")
fundBtn.onclick = fund

const balanceBtn = document.getElementById("currentBalance")
balanceBtn.onclick = getBalance

const withdrawBtn = document.getElementById("withdraw")
withdrawBtn.onclick = withdraw

const balanceLabel = document.getElementById("balanceLabel")

async function connect() {
  if (window.ethereum !== "undefined") {
    const { ethereum } = window

    await ethereum.request({ method: "eth_requestAccounts" })
    console.log("Connected ")
    console.log(await ethereum.selectedAddress, " current address")
  } else {
    console.log("i cant see a metamask")
  }
}

async function withdraw() {
  if (window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    console.log(signer)
    const contract = new ethers.Contract(contractAddress, abi, signer)

    let transactionResponse
    try {
      transactionResponse = await contract.withdraw()

      await listenForTransactionResponse(transactionResponse, provider)
      console.log("Done after promise")
    } catch (e) {
      console.log(e)
    }
  }
}

async function getBalance() {
  console.log(`getting balance...`)
  if (window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const balance = await provider.getBalance(contractAddress)

    balanceLabel.innerHTML = ethers.utils.formatEther(balance)
    console.log(ethers.utils.formatEther(balance))
  }
}

async function fund() {
  console.log(`funding with ${ethInput.value} ethers ...`)
  if (window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)

    let transactionResponse
    try {
      transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethInput.value),
      })

      await listenForTransactionResponse(transactionResponse, provider)
      console.log("Done after promise")
    } catch (e) {
      console.log(e)
    }
    console.log(transactionResponse)
  }
}

function listenForTransactionResponse(transactionResponse, provider) {
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(`Done with ${transactionReceipt.confirmations}`)
      resolve()
    })
  })
  // для reject можно какой-нибудь тайм-аут поставить и если слишком
  // долго выполняется, то выкидывать reject()
}
