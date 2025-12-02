import { isAddress } from 'viem';
import * as yup from 'yup';

export const lookupFormSchema = yup.object().shape({
  address: yup
    .string()
    .required('Address is required')
    .test('is-valid-address', 'Please enter a valid Address', (value) => {
      if (!value) return false;
      return isAddress(value);
    })
    .label('Address'),
});

export type LookupFormSchema = yup.InferType<typeof lookupFormSchema>;

