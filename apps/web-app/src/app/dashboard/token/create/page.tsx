'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { tokenCreateForm, TokenCreateForm } from '../_libs/tokenCreateFormSchema';
import { useDeployContract } from 'wagmi';
import { ContractArtifacts } from '@acme/token-smart-contract';
import { Hash } from 'viem';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';


export default function Page() {
  const form = useForm<TokenCreateForm>({
    resolver: yupResolver(tokenCreateForm),
    defaultValues: {
      name: 'Test Token',
      refNumber: 5666,
      totalSupply: '1000',
      symbol: 'XY',
    },
  });

  const router = useRouter();

  const { deployContract, isPending } = useDeployContract({
    mutation: {
      onSuccess: (data) => {
        router.push(`/dashboard/token/show/${data}`);
      },
    }
  });

  async function onSubmit(values: TokenCreateForm) {
    deployContract({
      abi: ContractArtifacts.abi,
      bytecode: ContractArtifacts.bytecode as Hash,
      args: [values.name, values.symbol, BigInt(values.totalSupply)],
    });
  }

  return (
    <div className="p-4 md:p-6 flex-1 relative">
      <Card>
        <CardHeader>
          <CardTitle>Create Token</CardTitle>
          <CardDescription>Fill out the details below. All fields are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <fieldset disabled={isPending} className="grid grid-cols-1 lg:grid-cols-2 gap-6  max-w-3xl">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="DXB:MY:526..." {...field} />
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
                        <Input placeholder="DXB:MY:526..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="refNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ref Number</FormLabel>
                      <FormControl>
                        <Input placeholder="12345xxx..." {...field} />
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
                      <FormLabel>Total supply</FormLabel>
                      <FormControl>
                        <Input placeholder="0" {...field} type="number" min={1} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </fieldset>
            </form>
          </Form>
          <CardFooter className="px-0 mt-6">
            <Button type="button" className="w-full sm:w-auto" disabled={isPending} onClick={() => form.handleSubmit(onSubmit)()}>
              Create Token {isPending && <Spinner />}
            </Button>
          </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
