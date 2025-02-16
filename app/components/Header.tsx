"use client";
import React from "react";
import { useAtom, useAtomValue } from "jotai";
import { Wallet, PlusCircle, ChevronDown, Plug } from "lucide-react";
import {
  currentWalletAtom,
  pxeAtom,
  walletsAtom,
  walletSDKAtom,
} from "../atoms";
import { useAccount } from "../hooks/useAccounts";
import { useLoadAccountFromStorage } from "../hooks/useLoadAccountsFromStorage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Spinner } from "./Spinnner";

const shortenAddress = (address: string) => {
  const str = address.toString();
  return `${str.slice(0, 6)}...${str.slice(-4)}`;
};

export const Header = () => {
  const [currentWallet, setCurrentWallet] = useAtom(currentWalletAtom);
  const wallets = useAtomValue(walletsAtom);
  const pxe = useAtomValue(pxeAtom);
  const { createAccount, isCreating } = useAccount(pxe!);
  const wallet = useAtomValue(walletSDKAtom);

  const { isLoading: isLoadingAccounts, error: accountsError } =
    useLoadAccountFromStorage(pxe!);

  const handleConnectSdk = async () => {
    try {
      const account = await wallet.connect();
      console.log("address: ", account.getAddress().toString());
    } catch (error) {
      console.log("Failed to connect to wallet client", error);
    }
  };

  const handleCreateWallet = async () => {
    try {
      await createAccount();
    } catch (error) {
      console.error("Failed to create wallet:", error);
    }
  };

  if (isLoadingAccounts) {
    console.log("loading accounts", isLoadingAccounts);
    return (
      <div className="text-sm text-muted-foreground">
        <Spinner />
      </div>
    );
  }

  if (accountsError) {
    return (
      <div className="text-sm text-destructive">Error: {accountsError}</div>
    );
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleConnectSdk}
              className="flex items-center gap-2"
            >
              <Plug className="w-4 h-4" />
              Connect SDK
            </Button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                {currentWallet ? (
                  <>
                    <span className="font-medium">
                      {shortenAddress(currentWallet.getAddress().toString())}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </>
                ) : (
                  <>
                    <span>No Wallet Selected</span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </>
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-80">
              <div className="py-2">
                {wallets.map((wallet, index) => (
                  <DropdownMenuItem
                    key={wallet.getAddress().toString()}
                    onClick={() => setCurrentWallet(wallet)}
                    className="flex items-center justify-between px-4 py-2 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Wallet {index + 1}</span>
                    </div>
                    <span className="text-sm text-muted-foreground px-2 py-1 bg-muted rounded-full">
                      {shortenAddress(wallet.getAddress().toString())}
                    </span>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                <Button
                  onClick={handleCreateWallet}
                  disabled={isCreating}
                  variant="ghost"
                  className="w-full flex items-center gap-2 cursor-pointer"
                >
                  {isCreating ? (
                    <>
                      <Spinner />
                      <span className="text-muted-foreground">
                        Creating Wallet...
                      </span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Create New Wallet</span>
                    </>
                  )}
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
