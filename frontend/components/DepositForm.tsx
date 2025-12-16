// frontend/components/DepositForm.tsx
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { contractAbi } from "@/constants";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import { parseUnits, getAddress } from "viem";

// Adresse USDC sur Sepolia (Circle officiel)
const USDC_ADDRESS = getAddress("0x1c7D4B196Cb0C7b01d743Fbc6116a902379C7238");

// ABI minimal pour approve et allowance
const erc20Abi = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    name: "approve",
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    name: "allowance",
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
] as const;

export default function DepositForm({ contractAddress }: { contractAddress: string }) {
  const [amount, setAmount] = useState("");
  const { address } = useAccount();
  const { data: hash, isPending, writeContract, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Vérifie l'allowance actuelle
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, contractAddress as `0x${string}`] : undefined,
  });

  // Rafraîchit l'allowance après une transaction réussie
  useEffect(() => {
    if (isSuccess) {
      toast.success("Transaction réussie !");
      refetchAllowance();
    }
  }, [isSuccess, refetchAllowance]);

  // Calcule le montant en wei (6 décimales pour USDC)
  const amountInWei = amount ? parseUnits(amount, 6) : BigInt(0);
  
  // Vérifie si l'approbation est nécessaire
  const needsApproval = !allowance || (allowance as bigint) < amountInWei;

  // Affiche les erreurs
  useEffect(() => {
    if (writeError) {
      console.error("Erreur writeContract:", writeError);
      toast.error(`Erreur: ${writeError.message}`);
    }
  }, [writeError]);

  // Fonction pour approuver
  const handleApprove = () => {
    console.log("handleApprove appelé");
    console.log("address:", address);
    console.log("amount:", amount);
    console.log("contractAddress:", contractAddress);
    console.log("amountInWei:", amountInWei.toString());
    
    if (!amount || !address) {
      toast.error("Montant ou adresse manquant");
      return;
    }
    
    toast.info("Envoi de la transaction d'approbation...");
    
    writeContract({
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [contractAddress as `0x${string}`, amountInWei],
    } as any);
  };

  // Fonction pour déposer
  const handleDeposit = () => {
    console.log("handleDeposit appelé");
    
    if (!amount || !address) {
      toast.error("Montant ou adresse manquant");
      return;
    }
    
    toast.info("Envoi de la transaction de dépôt...");
    
    writeContract({
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "deposit",
      args: [amountInWei],
    } as any);
  };

  return (
    <div className="space-y-4">
      <Input
        type="number"
        placeholder="Montant en USDC"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        disabled={isPending || isConfirming}
        className="w-full px-3 py-2 border rounded-md bg-gray-800"
      />
      
      {/* Affiche l'allowance actuelle pour debug */}
      <div className="text-xs text-gray-400 space-y-1">
        <p>Allowance actuelle: {allowance ? (Number(allowance) / 1e6).toFixed(2) : "0"} USDC</p>
        <p>Wallet connecté: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Non connecté"}</p>
        <p>Contrat cible: {contractAddress ? `${contractAddress.slice(0, 6)}...${contractAddress.slice(-4)}` : "Non défini"}</p>
      </div>

      {/* Bouton Approuver si nécessaire */}
      {amount && needsApproval && (
        <Button
          variant="default"
          size="default"
          onClick={handleApprove}
          disabled={isPending || isConfirming || !amount}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {isPending ? "Approbation..." : "1. Approuver USDC"}
        </Button>
      )}

      {/* Bouton Déposer */}
      <Button
        variant="default"
        size="default"
        onClick={handleDeposit}
        disabled={isPending || isConfirming || !amount || needsApproval}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "En attente..." : isConfirming ? "Confirmation..." : needsApproval ? "2. Déposer (approuver d'abord)" : "Déposer"}
      </Button>
    </div>
  );
}
