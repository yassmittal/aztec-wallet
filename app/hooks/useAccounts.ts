import { getSchnorrAccount } from "@aztec/accounts/schnorr";
import { AccountWalletWithSecretKey, Fr, PXE, Wallet } from "@aztec/aztec.js";
import { useAtom } from "jotai";
import { walletsAtom, currentWalletAtom } from "../atoms";
import { ACCOUNTS_STORAGE_KEY, NFT_CONTRACT_KEY } from "../constants";
import { NFTContract } from "@aztec/noir-contracts.js/NFT";
import { deriveSigningKey, GrumpkinScalar } from "@aztec/circuits.js";
// import { toast } from "react-hot-toast";
import { useLocalStorage } from "react-use";
import { useState } from "react";

export const useAccount = (pxeClient: PXE) => {
  const [accountInStorage, setAccountsInStorage] = useLocalStorage(
    ACCOUNTS_STORAGE_KEY,
    ""
  );
  const [_, setNFTContractInLocalStorage] = useLocalStorage(
    NFT_CONTRACT_KEY,
    ""
  );
  const [isCreating, setIsCreating] = useState(false);
  const [wallets, setWallets] = useAtom(walletsAtom);
  const [currentWallet, setCurrentWallet] = useAtom(currentWalletAtom);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let localAccounts: any[] = [];
  try {
    localAccounts = !!accountInStorage ? JSON.parse(accountInStorage) : [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("ERROR fetching accounts", err);
    localAccounts = [];
  }
  const createAccount = async () => {
    const type = "schnorr";
    try {
      setIsCreating(true);
      console.log("###### CREATE ACCOUNT FLOW ####");
      const secretKey = Fr.random();
      const signingPrivateKey = GrumpkinScalar.random();
      const account = await getSchnorrAccount(
        pxeClient!,
        secretKey,
        signingPrivateKey
      );
      console.log("Before Setup");
      await account.waitSetup();
      const wallet = (await account.getWallet()) as any as Wallet;
      const { address } = await account.getCompleteAddress();
      console.log("Account Address", address);
      const salt = account.getInstance().salt;
      try {
        const accountData = {
          address,
          secretKey,
          salt,
          type,
        };
        console.log(accountData);

        const formattedData = {
          address: address.toString(),
          secretKey: secretKey.toString(),
          salt: salt.toString(),
          type,
        };

        console.log(formattedData);
        console.log("Local accounts", localAccounts);
        localAccounts = [formattedData, ...localAccounts];
        setAccountsInStorage(JSON.stringify(localAccounts));
      } catch (e) {
        console.error(e);
        // toast.error(`Error saving account data ${e}`);
      }

      //TODO: Similarly fetch init hash and deployer
      // const deployedContract = await wallet.deploy()
      // console.log('Account created', wallet.getAddress().toShortString());
      setWallets([wallet, ...wallets]);
      if (!currentWallet) {
        setCurrentWallet(wallet);
      }
      return wallet;
    } catch (e) {
      console.error("Account error", e);
      // toast.error(`Error creating account ${e}`);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const deployNFTContract = async (
    admin: Wallet,
    name: string,
    symbol: string
  ) => {
    //TODO: Replace it with new nft contract
    const adminAddress = await admin.getAddress();
    const deployedContract = await NFTContract.deploy(
      admin,
      adminAddress,
      name,
      symbol
    )
      .send()
      .deployed();

    setNFTContractInLocalStorage(deployedContract.address.toString());
    const nft = await NFTContract.at(deployedContract.address, admin);
    return nft;
  };

  return { createAccount, deployNFTContract, isCreating };
};
