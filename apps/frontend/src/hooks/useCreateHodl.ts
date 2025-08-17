import {
  masterTransactionManagerAbi,
  masterTransactionManagerAddress,
} from "@/abis/MasterTransactionManager";
import { useCallback, useState } from "react";
import { isEthereumWallet } from "@dynamic-labs/ethereum";

import { useWallet } from "./useWallet";

export const useCreateHodl = () => {
  const wallet = useWallet();

  const [isLoading, setIsLoading] = useState(false);

  const createHodl = useCallback(
    async ({ name }: { name: string }) => {
      if (!wallet || !isEthereumWallet(wallet)) {
        return;
      }
      setIsLoading(true);

      const eid = ""; // TODO: GET THIS VALUE

      try {
        const walletClient = await wallet.getWalletClient();

        await walletClient.writeContract({
          address: masterTransactionManagerAddress,
          abi: masterTransactionManagerAbi,
          functionName: "createHodl",
          args: [name, wallet.address, eid],
        });
      } finally {
        setIsLoading(false);
      }
    },
    [wallet]
  );

  return { isLoading, createHodl };
};
