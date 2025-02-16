import { getSchnorrAccount } from "@aztec/accounts/schnorr";
import { AccountWalletWithSecretKey, PXE } from "@aztec/aztec.js";
import { deriveSigningKey, Fr } from "@aztec/circuits.js";
import { walletsAtom, currentWalletAtom } from "../atoms";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { useLocalStorage } from "react-use";
import { ACCOUNTS_STORAGE_KEY } from "../constants";

export const useLoadAccountFromStorage = (pxeClient: PXE | null) => {
  const [accountInStorage] = useLocalStorage(ACCOUNTS_STORAGE_KEY, "");
  const [wallets, setWallets] = useAtom(walletsAtom);
  const [currentWallet, setCurrentWallet] = useAtom(currentWalletAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse accounts outside of load function to catch errors early
  const parseLocalAccounts = () => {
    try {
      return accountInStorage ? JSON.parse(accountInStorage) : [];
    } catch (err) {
      console.error("ERROR FETCHING ACCOUNT", err);
      setError("Failed to parse accounts from storage");
      return [];
    }
  };

  const load = async () => {
    if (!pxeClient) {
      setError("PXE client not initialized");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const localAccounts = parseLocalAccounts();
      console.log("Loading accounts:", localAccounts.length);

      const registeredAccounts = await pxeClient.getRegisteredAccounts();
      const registeredAddresses = registeredAccounts.map(({ address }) =>
        address.toString()
      );
      console.log("Registered addresses:", registeredAddresses);

      const walletsPromises = localAccounts.map(
        async ({ secretKey, salt, address }) => {
          try {
            const account = await getSchnorrAccount(
              pxeClient,
              Fr.fromString(secretKey),
              deriveSigningKey(Fr.fromString(secretKey)),
              Fr.fromString(salt)
            );

            const accountAddress = account.getAddress().toString();
            console.log("Processing account:", accountAddress);

            let wallet: AccountWalletWithSecretKey | null = null;
            if (registeredAddresses.includes(accountAddress)) {
              wallet = await account.getWallet();
              console.log("Retrieved existing wallet");
            } else {
              wallet = await account.waitSetup();
              console.log("Set up new wallet");
            }
            return wallet;
          } catch (error) {
            console.error("Failed to process account:", error);
            return null;
          }
        }
      );

      const newWallets = (await Promise.all(walletsPromises)).filter(
        (wallet): wallet is AccountWalletWithSecretKey => wallet !== null
      );

      console.log("Setting wallets:", newWallets.length);
      setWallets(newWallets);

      if (newWallets.length > 0 && !currentWallet) {
        console.log("Setting current wallet");
        setCurrentWallet(newWallets[0]);
      }
    } catch (err) {
      console.error("Failed to load accounts from storage", err);
      setError("Failed to load accounts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (pxeClient) {
      load();
    }
  }, [pxeClient]);

  return {
    loadAccounts: load,
    isLoading,
    error,
    wallets,
    currentWallet,
  };
};
