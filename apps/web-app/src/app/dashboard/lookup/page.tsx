'use client';

import { Button } from '@acme/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acme/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { yupResolver } from '@hookform/resolvers/yup';
import { Search, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { lookupFormSchema, type LookupFormSchema } from './lookupFormSchema';

export default function LookupPage() {
    const router = useRouter();

    const form = useForm<LookupFormSchema>({
        resolver: yupResolver(lookupFormSchema),
        defaultValues: {
            address: '',
        },
    });

    const handleSubmit = (data: LookupFormSchema) => {
        router.push(`/dashboard/lookup/${data.address}`);
    };

    return (
        <div className="p-4 md:p-6 flex-1">
            <div className="max-w-2xl mx-auto">
                <Card className="mt-4">
                    <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Profile Lookup</CardTitle>
                        <CardDescription className="text-base">
                            Enter an Ethereum address to view their profile and activity
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Wallet Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="0x..."
                                                    className="font-mono text-sm"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Enter a valid address (0x followed by 40 hexadecimal characters)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    size="lg"
                                    disabled={form.formState.isSubmitting}
                                >
                                    <Search className="h-4 w-4 mr-2" />
                                    Lookup Profile
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

