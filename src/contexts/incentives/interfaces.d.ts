import { BigNumber } from '@ethersproject/bignumber';
import { Nullable } from '@interfaces/general';

type IncentiveDetails = {
    isUserQualified: boolean;
};

export interface IIncentivesContext {
    isLoading: boolean;
    incentivesDetails: Record<string, IncentiveDetails>;
}
