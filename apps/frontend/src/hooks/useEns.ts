import { ensReverseChainId } from "@/abis/MasterTransactionManager";
import { evmProvidersSelector } from "@dynamic-labs/ethereum-core";
import { useRpcProviders } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState } from "react";
// Optionally use a lightweight fetcher for ENS avatar
const fetchEnsAvatar = async (ensName: string): Promise<string | undefined> => {
  try {
    // Use the ENS avatar text record via public API
    const response = await fetch(`https://metadata.ens.domains/mainnet/avatar/${ensName}`);
    if (response.ok) {
      const data = await response.json();
      return data?.image_url || undefined;
    }
  } catch (e) {
    // Ignore errors
  }
  return undefined;
};

export const useReverseEns = (address: string) => {
  const rpcProvider = useRpcProviders(evmProvidersSelector);
  const [ensName, setEnsName] = useState<string | undefined>(address);
  const [ensAvatar, setEnsAvatar] = useState<string | undefined>();

  useEffect(() => {
    setEnsAvatar(undefined);
    rpcProvider
      .getProviderByChainId(ensReverseChainId)
      ?.provider.readContract({
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
      .then(async (value) => {
        if (value) {
          setEnsName(value);
          // Fetch avatar if ENS name is valid
          const avatar = await fetchEnsAvatar(value);
          setEnsAvatar(avatar);
        } else {
          setEnsName(undefined);
          setEnsAvatar(undefined);
        }
      });
  }, [address, rpcProvider.defaultProvider?.provider]);

  return { ensName, ensAvatar };
};
