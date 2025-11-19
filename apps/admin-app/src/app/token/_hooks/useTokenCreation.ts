import { useCreateToken } from '~/services/factory/useCreateBeaconProxy';
import { useStorePendingSeed } from '~/services/token/useStoreSeed';
import { TokenCreateFormSchema } from '../_libs/tokenCreateFormSchema';

export function useTokenCreation() {
  const { createToken, isPending: isCreating, data: transactionHash, transactionReceipt, reset: resetCreateBeaconProxy } = useCreateToken();

  const { mutateAsync: storePendingSeedAsync, isPending: isStoringSeed } = useStorePendingSeed();

  const mutateCreateToken = async (values: TokenCreateFormSchema) => {
    await storePendingSeedAsync({
      assetRefHash: values.assetRefHash,
      seedData: values.assetRefPairs,
    });
    await createToken([values.name, values.symbol, BigInt(values.totalSupply), values.assetRefHash as `0x${string}`, values.operator, values.owner]);
  };

  return {
    transactionHash,
    transactionReceipt,
    resetCreateBeaconProxy,
    storePendingSeedAsync,
    isPending: isCreating || isStoringSeed,
    mutateCreateToken,
  };
}
