'use client';

import { computeHashFromPairs } from '@acme/client/helpers';
import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@acme/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@acme/ui/select';
import { Spinner } from '@acme/ui/spinner';
import { Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { SubmitHandler, UseFormReturn, useFieldArray, useWatch } from 'react-hook-form';
import { useOperators } from '~/services/factory/useOperators';
import { TokenCreateFormSchema } from '../../_libs/tokenCreateFormSchema';

type TokenCreateFormProps = {
  form: UseFormReturn<TokenCreateFormSchema>;
  onSubmit: SubmitHandler<TokenCreateFormSchema>;
  isPending?: boolean;
};

export function TokenCreateForm({ onSubmit, isPending = false, form }: TokenCreateFormProps) {
  const { operators, isLoading: isLoadingOperators } = useOperators();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'assetRefPairs',
  });

  const assetRefPairs = useWatch({ name: 'assetRefPairs', control: form.control });

  // Compute hash when key-value pairs change
  useEffect(() => {
    const updateHash = async () => {
      const hash = await computeHashFromPairs(assetRefPairs);
      form.setValue('assetRefHash', hash, { shouldValidate: true });
    };

    updateHash();
  }, [assetRefPairs, form]);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Token</CardTitle>
        <CardDescription>Fill out the details below. All fields are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={isPending} className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-3xl">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Token" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input placeholder="MTK" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="totalSupply"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Supply</FormLabel>
                    <FormControl>
                      <Input placeholder="1000000" {...field} type="number" min={1} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Owner</FormLabel>
                    <FormControl>
                      <Input placeholder="0x0000000000..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="operator"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Operator</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={isPending || isLoadingOperators}>
                      <FormControl>
                        <SelectTrigger className="w-full min-w-0 overflow-hidden">
                          <SelectValue placeholder="Select an operator" className="font-mono" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {operators.length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">No operators available</div>
                        ) : operators.filter((op) => !op.isPaused).length === 0 ? (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">No active operators available</div>
                        ) : (
                          operators
                            .filter((op) => !op.isPaused)
                            .map((operator) => (
                              <SelectItem key={operator.operator} value={operator.operator}>
                                <div className="flex items-center min-w-0">
                                  <span className="font-mono truncate">{operator.operator}</span>
                                </div>
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assetRefHash"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Asset Reference Hash (SHA256)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="0x0000000000000000000000000000000000000000000000000000000000000000"
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Asset Reference Seed</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ key: '', value: '' })} disabled={isPending}>
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start">
                    <FormField
                      control={form.control}
                      name={`assetRefPairs.${index}.key`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Key" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`assetRefPairs.${index}.value`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Value" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={isPending || fields.length === 1}
                      className="shrink-0"
                      title={fields.length === 1 ? 'At least one pair is required' : 'Remove pair'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </fieldset>
          </form>
        </Form>
        <CardFooter className="px-0 mt-6">
          <Button type="submit" className="w-full sm:w-auto" disabled={isPending} onClick={() => form.handleSubmit(onSubmit)()}>
            Create Token {isPending && <Spinner />}
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
