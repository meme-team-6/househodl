import { evmProvidersSelector } from "@dynamic-labs/ethereum-core";
import { useRpcProviders } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";

export const useReverseEns = (address: string) => {
  const rpcProvider = useRpcProviders(evmProvidersSelector);

  const [ensName, setEnsName] = useState<string | undefined>(address);

  console.log({ address });
  useEffect(() => {
    rpcProvider.defaultProvider?.provider

      .readContract({
        address: "0x4F382928805ba0e23B30cFB75fC9E848e82DFD47",
        abi: [
          {
            inputs: [
              {
                internalType: "address",
                name: "addr",
                type: "address",
              },
            ],
            name: "nameForAddr",
            outputs: [
              {
                internalType: "string",
                name: "",
                type: "string",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "nameForAddr",
        args: [address as any],
      })
      .then((value) => {
        console.log({ value });
        setEnsName(value);
      });
  }, [address, rpcProvider.defaultProvider?.provider]);

  return ensName;
};
