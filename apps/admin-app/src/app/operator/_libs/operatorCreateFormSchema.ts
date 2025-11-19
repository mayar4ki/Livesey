import { Address } from 'viem';
import * as yup from 'yup';

export const operatorCreateFormSchema = yup.object().shape({
  operatorAddress: yup
    .string<Address>()
    .required('Operator address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Operator address must be a valid Ethereum address (0x + 40 hex characters)')
    .label('Operator Address'),
});

export type OperatorCreateFormSchema = yup.InferType<typeof operatorCreateFormSchema>;
