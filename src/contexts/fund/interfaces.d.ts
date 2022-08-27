import { BigNumber } from '@ethersproject/bignumber';
import { Nullable, Token, Incentive } from '@interfaces/general';

type FundDetails = {
    managementFee: BigNumber;
    evaluationPeriodBlocks: BigNumber;
    allowedTokens: Record<string, Token>;
    maxSingleWithdrawalFundTokenAmount: BigNumber;
    incentives: Record<string, Incentive>;
    fundToken: Token;
};

type FundState = {
    aumValue: Nullable<BigNumber>;
    fundTokenPrice: Nullable<BigNumber>;
    periodBeginningBlock: BigNumber;
    periodBeginningSupply: BigNumber;
    theoreticalSupply: BigNumber;
    actualSupply: BigNumber;
};

export interface IFundContext {
    isLoading: boolean;
    fundDetails: FundDetails;
    fundState: FundState;
    userFundTokenBalance: BigNumber;
}
