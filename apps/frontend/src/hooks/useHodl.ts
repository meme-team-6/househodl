import {
  masterTransactionManagerAbi,
  masterTransactionManagerAddress,
  masterTransactionManagerChainId,
} from "@/abis/MasterTransactionManager";
import { Hodl } from "@/lib/types";
import { convertCurrencyBigint } from "@/lib/utils";
import { evmProvidersSelector } from "@dynamic-labs/ethereum-core";
import { useRpcProviders } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { fromHex } from "viem";

type HodlResponse = {
  id: string;
  spendLimit: bigint;
  users: {
    chainId: number;
    heldUsd: bigint;
    realDebtUsd: bigint;
    trackedBalUsd: bigint;
    userAddress: string;
  }[];
  vanityName: string;
};

export const useHodl = (hodlId: string) => {
  const rpcProvider = useRpcProviders(evmProvidersSelector);

  const [isLoading, setIsLoading] = useState(true);
  const [hodl, setHodl] = useState<Hodl | undefined>();

  useEffect(() => {
    setIsLoading(true);
    rpcProvider
      .getProviderByChainId(masterTransactionManagerChainId)
      ?.provider.readContract({
        address: masterTransactionManagerAddress,
        abi: masterTransactionManagerAbi,
        functionName: "getHodlGroup",
        args: [hodlId],
      })
      .then((newHodl) => {
        const typedHodl = newHodl as HodlResponse;
        setHodl({
          name: fromHex(typedHodl.vanityName as `0x${string}`, "string"),
          spendLimit: convertCurrencyBigint(typedHodl.spendLimit),
          members: typedHodl.users.map((user) => ({
            chain: user.chainId.toString(),
            address: user.userAddress,
            debt: convertCurrencyBigint(user.realDebtUsd),
            usdcBalance: convertCurrencyBigint(user.trackedBalUsd),
          })),
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [hodlId, rpcProvider]);

  return { isLoading, hodl };
};
