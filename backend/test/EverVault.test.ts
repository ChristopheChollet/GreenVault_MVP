// test/EverVault.test.ts
import { expect } from "chai";
import { network } from "hardhat";

describe("EverVault", function () {
  async function deployEverVault() {
    const { ethers } = await network.connect();
    const [owner, user1] = await ethers.getSigners();
    const EverVault = await ethers.getContractFactory("EverVault");
    const everVault = await EverVault.deploy(
      "0x0000000000000000000000000000000000000001", // Mock USDC
      "0x0000000000000000000000000000000000000002", // Mock Aave
      "0x0000000000000000000000000000000000000003"  // Mock WBTC
    );
    await everVault.waitForDeployment();
    return { everVault, owner, user1 };
  }

  it("Should deploy successfully", async function () {
    const { everVault } = await deployEverVault();
    expect(await everVault.USDC()).to.not.equal("0x0000000000000000000000000000000000000000");
  });

  it("Should revert if deposit amount is zero", async function () {
    const { everVault, user1 } = await deployEverVault();
    await expect(everVault.connect(user1).deposit(0))
      .to.be.revertedWithCustomError(everVault, "ZeroAmount");
  });

  it("Should have correct fee recipient", async function () {
    const { everVault, owner } = await deployEverVault();
    expect(await everVault.feeRecipient()).to.equal(owner.address);
  });
});
