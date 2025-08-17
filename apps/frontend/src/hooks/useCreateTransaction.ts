import {
  masterTransactionManagerAbi,
  masterTransactionManagerAddress,
  masterTransactionManagerChainId,
} from "@/abis/MasterTransactionManager";
import { useCallback, useState } from "react";
import { isEthereumWallet } from "@dynamic-labs/ethereum";

import { useWallet } from "./useWallet";
import { stringToHex } from "viem";

export const useCreateHodl = () => {
  const wallet = useWallet();

  const [isLoading, setIsLoading] = useState(false);

  const createHodl = useCallback(
    async ({ name, maximumSpend }: { name: string; maximumSpend: number }) => {
      if (!wallet || !isEthereumWallet(wallet)) {
        return;
      }
      setIsLoading(true);

      try {
        const walletClient = await wallet.getWalletClient();

        await walletClient.writeContract({
          address: masterTransactionManagerAddress,
          abi: masterTransactionManagerAbi,
          functionName: "createHodl",
          args: [
            [
              wallet.address,
              masterTransactionManagerChainId,
              stringToHex(name, { size: 32 }),
              BigInt(maximumSpend) * BigInt(1e6),
            ],
          ],
        });
      } catch (error) {
        console.log("Create didn't work", error);
      } finally {
        setIsLoading(false);
      }
    },
    [wallet]
  );

  return { isLoading, createHodl };
};
