import * as yup from 'yup';

export const tokenCreateFormSchema = yup.object().shape({
  name: yup.string().required().label('Name'),
  symbol: yup.string().required().label('Symbol'),
  refNumber: yup.number().required().label('Ref Number'),
  totalSupply: yup.string().required().label('Total Supply'),
});

export type TokenCreateFormSchema = yup.InferType<typeof tokenCreateFormSchema>;
