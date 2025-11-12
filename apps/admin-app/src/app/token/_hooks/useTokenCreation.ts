import { useCreateBeaconProxy } from '~/services/factory/useCreateBeaconProxy';
import { useStorePendingSeed } from '~/services/token/useStoreSeed';
import { TokenCreateFormSchema } from '../_libs/tokenCreateFormSchema';

export function useTokenCreation() {
  const {
    createBeaconProxy,
    isPending: isCreatingBeaconProxy,
    data: transactionHash,
    transactionReceipt,
    reset: resetCreateBeaconProxy,
  } = useCreateBeaconProxy();

  const { mutateAsync: storePendingSeedAsync, isPending: isStoringSeed } = useStorePendingSeed();

  const mutateCreateToken = async (values: TokenCreateFormSchema) => {
    await storePendingSeedAsync({
      assetRefHash: values.assetRefHash,
      seedData: values.assetRefPairs,
    });
    await createBeaconProxy([values.name, values.symbol, values.assetRefHash as `0x${string}`, BigInt(values.totalSupply), values.owner]);
  };

  return {
    createBeaconProxy,
    transactionHash,
    transactionReceipt,
    resetCreateBeaconProxy,
    storePendingSeedAsync,
    isPending: isCreatingBeaconProxy || isStoringSeed,
    mutateCreateToken,
  };
}
