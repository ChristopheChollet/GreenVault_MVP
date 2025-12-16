// frontend/components/WithdrawForm.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { contractAbi } from "@/constants";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

export default function WithdrawForm({ contractAddress }: { contractAddress: string }) {
  const [shares, setShares] = useState("");
  const { address } = useAccount();
  const { data: hash, isPending, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const { data: balance } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  useEffect(() => {
    if (isSuccess) toast.success("Retrait réussi !");
  }, [isSuccess]);

  const handleWithdraw = () => {
    if (!shares) return;
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi as any,
      functionName: "withdraw",
      args: [BigInt(shares)],
    } as any);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-400">Ton solde: {balance?.toString() ?? "0"} parts</p>
      <Input
        type="number"
        placeholder="Nombre de parts"  // ✅ Label intégré dans le placeholder
        value={shares}
        onChange={(e) => setShares(e.target.value)}
        disabled={isPending || isConfirming}
        className="w-full px-3 py-2 border rounded-md bg-gray-800"
      />
      <Button
        variant="default"
        size="default"
        onClick={handleWithdraw}
        disabled={isPending || isConfirming || !shares}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isPending ? "En attente..." : isConfirming ? "Confirmation..." : "Retirer"}
      </Button>
    </div>
  );
}