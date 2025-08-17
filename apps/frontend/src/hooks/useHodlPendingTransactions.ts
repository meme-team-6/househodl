import {
  masterTransactionManagerAbi,
  masterTransactionManagerAddress,
  masterTransactionManagerChainId,
} from "@/abis/MasterTransactionManager";
import { convertCurrencyBigint } from "@/lib/utils";

import { evmProvidersSelector } from "@dynamic-labs/ethereum-core";
import { useRpcProviders } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";

type TransactionResponse = {
  amountUsd: bigint;
  hodlId: string;
  id: string;
  originatingUser: string;
  submittedAt: number;
  submittingUser: string;
  transactionCreatedAt: number;
  userChainId: number;
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

        setTransactions(
          typedData.map((transaction) => ({
            vanityName: "Name",
            amountUsd: convertCurrencyBigint(transaction.amountUsd),
            hodlId: transaction.hodlId,
            id: transaction.id,
            originatingUser: transaction.originatingUser,
            submittedAt: transaction.submittedAt,
            submittingUser: transaction.submittingUser,
            transactionCreatedAt: transaction.transactionCreatedAt,
            userChainId: transaction.userChainId,
          }))
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [hodlId, rpcProvider]);

  return { isLoading, transactions };
};
