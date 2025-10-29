import * as yup from 'yup';

export const tokenCreateForm = yup.object().shape({
  name: yup.string().required().label('Name'),
  refNumber: yup.number().required().label('Ref Number'),
  totalSupply: yup.string().required().label('Total Supply'),
});

export type TokenCreateForm = yup.InferType<typeof tokenCreateForm>;
