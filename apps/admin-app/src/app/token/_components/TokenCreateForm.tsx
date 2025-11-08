'use client';

import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@acme/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { Spinner } from '@acme/ui/spinner';
import { SubmitHandler, UseFormReturn } from 'react-hook-form';
import { TokenCreateFormSchema } from '../_libs/tokenCreateFormSchema';

type TokenCreateFormProps = {
  form: UseFormReturn<TokenCreateFormSchema>;
  onSubmit: SubmitHandler<TokenCreateFormSchema>;
  isPending?: boolean;
};

export function TokenCreateForm({ onSubmit, isPending = false, form }: TokenCreateFormProps) {
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
