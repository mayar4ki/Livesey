'use client';

import { useCreateProposal } from '@acme/client/services/proposal/useCreateProposal';
import { proposalDurationToSeconds } from '@acme/client/services/proposal/utils';
import { Button } from '@acme/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@acme/ui/form';
import { Input } from '@acme/ui/input';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { createProposalFormSchema, type CreateProposalFormSchema } from './createProposalFormSchema';

interface CreateProposalFormProps {
  deployedTokenId: string;
  onSuccess?: () => void;
}

export function CreateProposalForm({ deployedTokenId: tokenId, onSuccess }: CreateProposalFormProps) {
  const createProposalMutation = useCreateProposal();

  const form = useForm<CreateProposalFormSchema>({
    resolver: yupResolver(createProposalFormSchema),
    defaultValues: {
      title: '',
      description: '',
      durationDays: 0,
      durationHours: 0,
      durationMinutes: 0,
    },
  });

  const handleSubmit = async (data: CreateProposalFormSchema) => {
    const totalSeconds = proposalDurationToSeconds(data);

    await createProposalMutation.mutateAsync({
      title: data.title,
      description: data.description,
      duration: totalSeconds,
      tokenId,
    });

    // Reset form and close
    form.reset();

    onSuccess?.();
  };

  const handleCancel = () => {
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Proposal Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter proposal title" {...field} />
              </FormControl>
              <FormDescription>Enter a clear and concise title for your proposal</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Describe your proposal in detail..."
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide a detailed description of what this proposal aims to achieve
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Voting Duration</FormLabel>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="durationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Days</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="365"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value ?? 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hours</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="23"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value ?? 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="durationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minutes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      min="0"
                      max="59"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : Number(e.target.value);
                        field.onChange(value);
                      }}
                      value={field.value ?? 0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormDescription>Set the voting period duration. At least 1 minute is required.</FormDescription>
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={form.formState.isSubmitting || createProposalMutation.isPending}
          >
            {createProposalMutation.isPending ? 'Creating...' : 'Create Proposal'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={form.formState.isSubmitting || createProposalMutation.isPending}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
