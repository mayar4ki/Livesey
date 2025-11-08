import { Address } from 'viem';
import * as yup from 'yup';

export const tokenCreateFormSchema = yup.object().shape({
  name: yup.string().required().label('Name'),
  symbol: yup.string().required().label('Symbol'),
  totalSupply: yup.string().required().label('Total Supply'),
  owner: yup.string<Address>().required().label('Owner'),
});

export type TokenCreateFormSchema = yup.InferType<typeof tokenCreateFormSchema>;
