// frontend/components/TVLDisplay.tsx
"use client";
import { useReadContract } from "wagmi";
import { contractAbi } from "@/constants";
import { formatUnits } from "viem";
import { DollarSign } from "lucide-react";

export default function TVLDisplay({ contractAddress }: { contractAddress: string }) {
  const { data: tvl, isLoading, error } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: "totalValueLocked",
  });

  if (isLoading) return <p className="text-gray-400">Chargement du TVL...</p>;
  if (error) return <p className="text-red-500">Erreur: {error.message}</p>;

  return (
    <div className="mt-4 pt-4 border-t border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <DollarSign className="h-4 w-4 text-gray-400" />
        <h3 className="font-semibold">Total Value Locked (TVL)</h3>
      </div>
      <p className="text-lg">
        {tvl ? parseFloat(formatUnits(tvl as bigint, 6)).toFixed(2) : "0.00"} <span className="text-gray-400">USDC</span>
      </p>
    </div>
  );
}
