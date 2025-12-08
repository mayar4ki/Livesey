import * as yup from 'yup';

export const distributeDividendsSchema = yup.object().shape({
  amount: yup
    .string()
    .required('Amount is required')
    .test('is-positive', 'Amount must be greater than 0', (value) => {
      const numericValue = Number(value);
      return Number.isFinite(numericValue) && numericValue > 0;
    }),
});

export type DistributeDividendsFormSchema = yup.InferType<typeof distributeDividendsSchema>;
