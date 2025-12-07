import { isAddress } from 'viem';
import * as yup from 'yup';

export const operatorLookupFormSchema = yup.object().shape({
  address: yup
    .string()
    .required('Operator address is required')
    .test('is-valid-address', 'Please enter a valid operator address', (value) => {
      if (!value) return false;
      return isAddress(value);
    })
    .label('Operator Address'),
});

export type OperatorLookupFormSchema = yup.InferType<typeof operatorLookupFormSchema>;
