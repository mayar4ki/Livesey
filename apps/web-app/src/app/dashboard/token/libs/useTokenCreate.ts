import { useMutation } from '@tanstack/react-query';

import axios from 'axios';
import { TokenCreateForm } from './tokenCreateFormSchema';

export const useTokenCreate = () => {
  return useMutation({
    mutationFn: async (payload: TokenCreateForm) => await axios.post('/api/token', payload),
  });
};
