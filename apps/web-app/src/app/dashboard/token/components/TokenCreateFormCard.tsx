'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import type { UseFormReturn } from 'react-hook-form';
import type { TokenCreateForm } from '../libs/tokenCreateFormSchema';

type TokenCreateFormCardProps = {
    form: UseFormReturn<TokenCreateForm>;
    onSubmit: (values: TokenCreateForm) => void;
    isPending: boolean;
};

export function TokenCreateFormCard({ form, onSubmit, isPending }: TokenCreateFormCardProps) {
    return (
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
    );
}

