import { createPublicClient, http } from "viem";
import {hardhat, sepolia} from "viem/chains";

export const client = createPublicClient({
  chain: hardhat,
  transport: http(),
});