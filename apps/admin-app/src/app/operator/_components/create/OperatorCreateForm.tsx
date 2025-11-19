'use client';

import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@acme/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { Spinner } from '@acme/ui/spinner';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { OperatorCreateFormSchema } from '../../_libs/operatorCreateFormSchema';

type OperatorCreateFormProps = {
  form: UseFormReturn<OperatorCreateFormSchema>;
  onSubmit: SubmitHandler<OperatorCreateFormSchema>;
  isPending?: boolean;
};

export function OperatorCreateForm({ onSubmit, isPending = false, form }: OperatorCreateFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Operator</CardTitle>
        <CardDescription>Enter the operator address to add to the Factory contract. All fields are required.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={isPending} className="grid grid-cols-1 gap-6 max-w-2xl">
              <FormField
                control={form.control}
                name="operatorAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operator Address</FormLabel>
                    <FormControl>
                      <Input placeholder="0x0000000000000000000000000000000000000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </fieldset>
          </form>
        </Form>
        <CardFooter className="px-0 mt-6">
          <Button type="submit" className="w-full sm:w-auto" disabled={isPending} onClick={() => form.handleSubmit(onSubmit)()}>
            Add Operator {isPending && <Spinner />}
          </Button>
        </CardFooter>
      </CardContent>
    </Card>
  );
}
