"use client";

import { createPXEClient, waitForPXE } from "@aztec/aztec.js";
import { useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { pxeAtom } from "../atoms";
import { RPC_URL } from "../constants";

export const PxeProvider = ({ children }: { children: React.ReactNode }) => {
  const setPXEClient = useSetAtom(pxeAtom);
  // const setWalletSDK = useSetAtom(walletSDKAtom)
  // const [pxeLocal, setPXELocal] = useState<PXE>();
  const [isLoading, setIsLoading] = useState(false);
  const [, setErrorMessage] = useState("");

  useEffect(() => {
    setErrorMessage("");
    setIsLoading(true);
    const pxeClient = createPXEClient(RPC_URL);
    waitForPXE(pxeClient)
      .then((_) => {
        setPXEClient(pxeClient);
        // const wallet = new PopupWalletSdk(pxeClient as any)
        // setWalletSDK(wallet)

        // setPXELocal(pxeClient);
        console.log("Pxe created", pxeClient);
      })
      .catch((error) => {
        setErrorMessage(error.toString());
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return <div>{children}</div>;
};
