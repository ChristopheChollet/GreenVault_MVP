// frontend/components/Header.tsx
"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 bg-gray-800">
      <h1 className="text-xl font-bold">EverVault</h1>
      <ConnectButton />
    </header>
  );
}
