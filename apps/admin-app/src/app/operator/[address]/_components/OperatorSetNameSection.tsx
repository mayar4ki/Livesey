'use client';

import { useUpdateOperatorName } from '@acme/client/services/operator/useUpdateOperatorName';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { toast } from '@acme/ui/sonner';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Loader2, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

const operatorNameSchema = yup.object().shape({
  name: yup
    .string()
    .required('Operator name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters'),
});

type OperatorNameFormSchema = yup.InferType<typeof operatorNameSchema>;

type OperatorSetNameSectionProps = {
  operatorAddress: string;
  chainId: number;
  currentName?: string;
};

export function OperatorSetNameSection({ operatorAddress, chainId, currentName }: OperatorSetNameSectionProps) {
  const hasName = !!currentName;
  const queryClient = useQueryClient();
  const { mutate: updateOperatorName, isPending } = useUpdateOperatorName();

  const form = useForm<OperatorNameFormSchema>({
    resolver: yupResolver(operatorNameSchema),
    defaultValues: {
      name: currentName || '',
    },
  });

  const handleSubmit = (data: OperatorNameFormSchema) => {
    updateOperatorName(
      { address: operatorAddress, chainId, name: data.name },
      {
        onSuccess: () => {
          toast.success(`Operator name ${hasName ? 'updated' : 'set'} successfully`);
          queryClient.invalidateQueries({ queryKey: ['operator-details', chainId, operatorAddress] });
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : 'Failed to update operator name');
        },
      }
    );
  };

  return (
    <Card className={hasName ? '' : 'border-amber-500/50 bg-amber-500/5'}>
      <CardHeader>
        <div className="flex items-center gap-2">
          {!hasName && <AlertTriangle className="h-5 w-5 text-amber-500" />}
          <CardTitle className="text-lg">{hasName ? 'Operator Name' : 'Operator Name Required'}</CardTitle>
        </div>
        <CardDescription>
          {hasName
            ? 'Update the operator name to help identify this operator.'
            : "This operator doesn't have a name yet. Set a name to make it easier to identify."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col  gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Operator Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter operator name..." {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-end justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Pencil className="h-4 w-4 mr-2" />
                    {hasName ? 'Update Name' : 'Set Name'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
