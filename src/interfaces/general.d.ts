import { ReactNode } from 'react';
import { BigNumber } from '@ethersproject/bignumber';

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type WrapperProps = {
    children?: ReactNode;
};

export type EnumType<T> = {
    label: string;
    value: T;
};

export type Token = {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    oracle?: string;
};

export type Incentive = {
    address: string;
    name: string;
};

export type Request = {
    index: BigNumber;
    // Accessor struct values
    isDeposit: boolean;
    token: string;
    queueNumber: BigNumber;
    // Request creation values
    user: string;
    amountIn: BigNumber;
    minAmountOut: BigNumber;
    blockDeadline: BigNumber;
    incentive: string;
    // Request processed fields
    status: number;
    blockUpdated: BigNumber;
    computedAmountOut: BigNumber;
    isReclaimed: boolean;
};

export type DepositRequestArgs = {
    tokenAddress: string;
    amountIn: BigNumber;
    minAmountOut: BigNumber;
    blockDeadline: BigNumber;
    incentiveAddress: string;
};

export type WithdrawalRequestArgs = {
    tokenAddress: string;
    amountIn: BigNumber;
    minAmountOut: BigNumber;
    blockDeadline: BigNumber;
};
