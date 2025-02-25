const {
    DefenderRelayProvider,
    DefenderRelaySigner,
  } = require('defender-relay-client/lib/ethers')
  const { ethers } = require('hardhat')
  const { writeFileSync } = require('fs')
  
  async function main() {
    require('dotenv').config()
    const credentials = {
      apiKey: process.env.RELAYER_API_KEY,
      apiSecret: process.env.RELAYER_API_SECRET,
    }
    const provider = new DefenderRelayProvider(credentials)
    const relaySigner = new DefenderRelaySigner(credentials, provider, {
      speed: 'safeLow',
    })
  
    const Forwarder = await ethers.getContractFactory('MinimalForwarder')
    const forwarder = await Forwarder.connect(relaySigner)
      .deploy()
      .then((f) => f.deployed())
  
    const Token = await ethers.getContractFactory('CollegeContract')
    const token = await Token.connect(relaySigner)
      .deploy(forwarder.address)
      .then((f) => f.deployed())
  
    writeFileSync(
      'deploy.json',
      JSON.stringify(
        {
          MinimalForwarder: forwarder.address,          
        },
        null,
        2
      )
    )
    const [deployer] = await ethers.getSigners();
    console.log("Contract Deployed by"+ deployer.address);
    console.log("Token address (Contract Address):", token.address);
    console.log(
      ` MinimalForwarder: ${forwarder.address}`
    )
  }
  
  if (require.main === module) {
    main()
      .then(() => process.exit(0))
      .catch((error) => {
        console.error(error)
        process.exit(1)
      })
  }