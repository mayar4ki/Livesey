import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Hash } from 'viem';

type CreateTokenResponse = {
    success: boolean;
    message: string;
    tx: string;
};


export function useCreateToken() {
    return useMutation({
        mutationFn: async (payload: { tx: Hash }) => await axios.post<CreateTokenResponse>('/api/token', payload),
    });
}

