"use client";
import React, { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import {
  currentWalletAtom,
  pxeAtom,
  walletsAtom,
  walletSDKAtom,
} from "../atoms";
import { useAccount } from "../hooks/useAccounts";
import { useLoadAccountFromStorage } from "../hooks/useLoadAccountsFromStorage";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Spinner } from "./Spinnner";

export const Header = () => {
  const [currentWallet, setCurrentWallet] = useAtom(currentWalletAtom);
  const wallets = useAtomValue(walletsAtom);
  const pxe = useAtomValue(pxeAtom);
  const { createAccount, isCreating } = useAccount(pxe!);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const wallet = useAtomValue(walletSDKAtom);

  const shortenAddress = (address: string) => {
    const str = address.toString();
    return `${str.slice(0, 6)}...${str.slice(-4)}`;
  };

  useLoadAccountFromStorage(pxe!);
  const handleConnectSdk = async () => {
    try {
      const account = await wallet.connect();
      console.log("address: ", account.getAddress().toString());
    } catch (error) {
      console.log("Failed to connect to wallet client", error);
    }
  };

  return (
    <header>
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <nav className="flex items-center space-x-4">
            <Link href="/admin">Admin Panel</Link>
            <button onClick={handleConnectSdk}>Connect SDK</button>
          </nav>

          {/* Wallet Management */}
          <div className="flex items-center space-x-4 text-black">
            <div className="relative">
              <Button
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
              >
                {currentWallet ? (
                  <>
                    <span className="font-medium">
                      {shortenAddress(currentWallet.getAddress().toString())}
                    </span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </>
                ) : (
                  <span>No Wallet Selected</span>
                )}
              </Button>

              {/* Wallet Dropdown */}
              {isWalletDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl z-50 
                               border border-purple-100 overflow-hidden"
                >
                  <div className="py-2">
                    {wallets.map((wallet, index) => (
                      <button
                        key={wallet.getAddress().toString()}
                        onClick={() => {
                          setCurrentWallet(wallet);
                          setIsWalletDropdownOpen(false);
                        }}
                        className={`w-full my-2 px-4 py-3 text-left bg-indigo-50 duration-200
                                  ${
                                    currentWallet === wallet
                                      ? "bg-indigo-100 text-indigo-700"
                                      : "text-gray-700"
                                  }`}
                      >
                        <div className="flex items-center justify-between bg-transparent">
                          <span className="font-medium">
                            Wallet {index + 1}
                          </span>
                          <span className="text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                            {shortenAddress(wallet.getAddress().toString())}
                          </span>
                        </div>
                      </button>
                    ))}

                    {/* Create New Wallet Button */}
                    <button
                      onClick={async () => {
                        await createAccount();
                        setIsWalletDropdownOpen(false);
                      }}
                      disabled={isCreating}
                      className="w-full px-4 py-3 mt-2 text-left border-t border-purple-100 
                               hover:bg-linear-to-r hover:from-indigo-50 hover:to-purple-50 
                               flex items-center group transition-all duration-200"
                    >
                      {isCreating ? (
                        <>
                          <Spinner />
                          <span className="ml-2 text-indigo-600">
                            Creating Wallet...
                          </span>
                        </>
                      ) : (
                        <>
                          <div
                            className="w-8 h-8 flex items-center justify-center rounded-full 
                                        bg-linear-to-r from-indigo-500 to-purple-500 text-white
                                        group-hover:scale-110 transition-transform duration-200"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 4v16m8-8H4"
                              />
                            </svg>
                          </div>
                          <span className="ml-2 font-medium text-gray-300 group-hover:text-indigo-400">
                            Create New Wallet
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
