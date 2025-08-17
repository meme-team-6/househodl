import {
  masterTransactionManagerAbi,
  masterTransactionManagerAddress,
  masterTransactionManagerChainId,
} from "@/abis/MasterTransactionManager";
import { convertCurrencyBigint } from "@/lib/utils";

import { evmProvidersSelector } from "@dynamic-labs/ethereum-core";
import { useRpcProviders } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
import { fromHex } from "viem";

type TransactionResponse = {
  hodlId: string;
  id: string;
  transaction: {
    amountUsd: bigint;
    approvalVotes: string[];
    createdAt: number;
    disapprovalVotes: string[];
    originatingUser: string;
    shares: never[];
    vanityName: string;
  };
};

type Transaction = {
  vanityName: string;
  amountUsd: number;
  hodlId: string;
  id: string;
  originatingUser: string;
  submittedAt: number;
  submittingUser: string;
  transactionCreatedAt: number;
  userChainId: number;
};

export const useHodlPendingTransactions = (hodlId: string) => {
  const rpcProvider = useRpcProviders(evmProvidersSelector);

  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setIsLoading(true);
    rpcProvider
      .getProviderByChainId(masterTransactionManagerChainId)
      ?.provider.readContract({
        address: masterTransactionManagerAddress,
        abi: masterTransactionManagerAbi,
        functionName: "listPendingTransactions",
        args: [hodlId],
      })
      .then((data) => {
        const typedData = data as TransactionResponse[];
        console.log({ data });
        setTransactions(
          typedData.map((transaction) => ({
            vanityName: fromHex(
              transaction.transaction.vanityName as `0x${string}`,
              "string"
            ),
            amountUsd: convertCurrencyBigint(transaction.transaction.amountUsd),
            hodlId: transaction.hodlId,
            id: transaction.id,
            originatingUser: transaction.transaction.originatingUser,
            submittedAt: transaction.transaction.createdAt,
            submittingUser: transaction.transaction.originatingUser,
            transactionCreatedAt: transaction.transaction.createdAt,
            userChainId: masterTransactionManagerChainId,
          }))
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [hodlId, rpcProvider]);

  return { isLoading, transactions };
};
