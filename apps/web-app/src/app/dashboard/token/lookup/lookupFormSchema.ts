import { isAddress } from 'viem';
import * as yup from 'yup';

export const tokenLookupFormSchema = yup.object().shape({
  address: yup
    .string()
    .required('Token address is required')
    .test('is-valid-address', 'Please enter a valid token contract address', (value) => {
      if (!value) return false;
      return isAddress(value);
    })
    .label('Token Address'),
});

export type TokenLookupFormSchema = yup.InferType<typeof tokenLookupFormSchema>;
