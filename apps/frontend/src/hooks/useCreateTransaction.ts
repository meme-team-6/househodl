import {
  masterTransactionManagerAbi,
  masterTransactionManagerAddress,
  masterTransactionManagerChainId,
} from "@/abis/MasterTransactionManager";
import { useCallback, useState } from "react";
import { isEthereumWallet } from "@dynamic-labs/ethereum";

import { useWallet } from "./useWallet";

import { useHodl } from "./useHodl";
import { useSwitchNetwork } from "@dynamic-labs/sdk-react-core";
import { stringToHex } from "viem";

export const useCreateTransaction = (hodlId: string) => {
  const wallet = useWallet();
  const { hodl } = useHodl(hodlId);
  const switchNetwork = useSwitchNetwork();

  const [isLoading, setIsLoading] = useState(false);

  const createTransaction = useCallback(
    async ({ name, amount }: { name: string; amount: number }) => {
      if (!wallet || !isEthereumWallet(wallet)) {
        return;
      }
      setIsLoading(true);

      switchNetwork({ wallet, network: masterTransactionManagerChainId });

      try {
        const walletClient = await wallet.getWalletClient();
        const args = [
          [
            hodlId,
            masterTransactionManagerChainId,
            BigInt(amount * 1e3) * BigInt(1e3),

            (hodl?.members || []).map((member) => [
              member.address,
              (1 / hodl!.members.length) * 100,
            ]),
            stringToHex(name, { size: 32 }),
          ],
        ];

        console.log({ args });
        await walletClient.writeContract({
          address: masterTransactionManagerAddress,
          abi: masterTransactionManagerAbi,
          functionName: "submitTransaction",
          args: args,
        });
      } catch (error) {
        console.log("Create didn't work", error);
      } finally {
        setIsLoading(false);
      }
    },
    [wallet]
  );

  return { isLoading, createTransaction };
};
