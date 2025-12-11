import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminEIP712 } from "../../hooks/useAdminEIP712";
import { apiClient } from "../apiClient";

type UpdateOperatorNamePayload = {
  address: string;
  chainId: number;
  name: string;
};

/**
 * Hook to update an operator's name
 * Requires admin signature for authentication
 * @returns Mutation function to update operator name
 */
export function useUpdateOperatorName() {
  const queryClient = useQueryClient();
  const { makeAdminRequest } = useAdminEIP712();

  return useMutation({
    mutationFn: async ({
      address,
      chainId,
      name,
    }: UpdateOperatorNamePayload) => {
      const { headers } = await makeAdminRequest(
        "PATCH",
        `/api/operator/${address}/${chainId}/name`,
        { name }
      );

      await apiClient.patch(
        `operator/${address}/${chainId}/name`,
        { name },
        { headers }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["operator-list"] });
    },
  });
}
