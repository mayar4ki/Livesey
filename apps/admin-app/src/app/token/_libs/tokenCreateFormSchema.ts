import { Address } from 'viem';
import * as yup from 'yup';

const keyValuePairSchema = yup.object().shape({
  key: yup.string().required('Key is required').label('Key'),
  value: yup.string().required('Value is required').label('Value'),
});

export const tokenCreateFormSchema = yup.object().shape({
  name: yup.string().required().label('Name'),
  symbol: yup.string().required().label('Symbol'),
  totalSupply: yup.string().required().label('Total Supply'),
  owner: yup.string<Address>().required().label('Owner'),
  operator: yup
    .string<Address>()
    .required('Operator is required')
    .matches(/^0x[a-fA-F0-9]{40}$/, 'Operator must be a valid Ethereum address (0x + 40 hex characters)')
    .label('Operator'),
  assetRefPairs: yup.array().of(keyValuePairSchema).min(1, 'At least one key-value pair is required').default([]).label('Asset Reference Pairs'),
  assetRefHash: yup
    .string()
    .required('Asset Reference Hash is required')
    .matches(/^0x[a-fA-F0-9]{64}$/, 'Asset Reference Hash must be a valid bytes32 hex string (0x + 64 hex characters)')
    .label('Asset Reference Hash'),
});

export type TokenCreateFormSchema = yup.InferType<typeof tokenCreateFormSchema>;
