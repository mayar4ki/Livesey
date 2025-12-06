import { Address } from 'viem';
import * as yup from 'yup';

type TokenOption = {
  address: Address;
  symbol: string;
  name: string;
  decimals: number;
};

export const limitOrderFormSchema = yup.object().shape({
  fromToken: yup.mixed<TokenOption>().required('From token is required').label('From Token'),
  toToken: yup.mixed<TokenOption>().required('To token is required').label('To Token'),
  fromAmount: yup
    .string()
    .required()
    .test('is-positive', 'Amount must be greater than 0', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    })
    .test('is-valid-number', 'Please enter a valid number', (value) => {
      if (!value) return false;
      return !isNaN(parseFloat(value));
    })
    .label('From Amount'),
  toAmount: yup
    .string()
    .required()
    .test('is-positive', 'Amount must be greater than 0', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    })
    .test('is-valid-number', 'Please enter a valid number', (value) => {
      if (!value) return false;
      return !isNaN(parseFloat(value));
    })
    .label('From Amount'),
  limitPrice: yup.string().default('').label('Limit Price'),
  expiredAt: yup
    .string()
    .required('Expiration date is required')
    .test('is-future-date', 'Expiration date must be in the future', (value) => {
      if (!value) return false;
      const selectedDate = new Date(value);
      const now = new Date();
      return selectedDate > now;
    })
    .label('Expired At'),
});

export type LimitOrderFormSchema = yup.InferType<typeof limitOrderFormSchema>;
