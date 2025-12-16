// scripts/deploy.ts
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();
  console.log("Déploiement avec le compte:", deployer.address);

  // Adresses réelles sur Sepolia (en minuscules pour éviter les erreurs de checksum)
  const USDC_ADDRESS = "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238"; // Circle USDC Sepolia
  const AAVE_LENDING_ADDRESS = "0x6ae43d3271ff6888e7fc43fd7321a503ff738951"; // Aave V3 Pool Sepolia  
  const WBTC_ADDRESS = "0x29f2d40b0605204364af54ec677bd022da425d03"; // WBTC Sepolia (Aave)

  console.log("Adresses utilisées:");
  console.log("  USDC:", USDC_ADDRESS);
  console.log("  Aave Pool:", AAVE_LENDING_ADDRESS);
  console.log("  WBTC:", WBTC_ADDRESS);

  const EverVault = await ethers.getContractFactory("EverVault");
  const everVault = await EverVault.deploy(USDC_ADDRESS, AAVE_LENDING_ADDRESS, WBTC_ADDRESS);
  await everVault.waitForDeployment();
  
  const contractAddress = await everVault.getAddress();
  console.log("✅ EverVault déployé à:", contractAddress);
  console.log("");
  console.log("Mettez à jour votre .env avec:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
