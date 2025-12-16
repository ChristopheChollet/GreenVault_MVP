import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const EverVaultModule = buildModule("EverVaultModule", (m) => {
  // Adresses fictives pour le déploiement local
  const usdcAddress = m.getParameter("usdcAddress", "0x0000000000000000000000000000000000000001");
  const aaveLendingAddress = m.getParameter("aaveLendingAddress", "0x0000000000000000000000000000000000000002");
  const wbtcAddress = m.getParameter("wbtcAddress", "0x0000000000000000000000000000000000000003");

  const everVault = m.contract("EverVault", [usdcAddress, aaveLendingAddress, wbtcAddress]);

  return { everVault };
});

export default EverVaultModule;
