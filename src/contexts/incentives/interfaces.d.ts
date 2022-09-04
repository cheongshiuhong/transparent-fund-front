type IncentiveDetails = {
    isUserQualified: boolean;
};

export interface IIncentivesContext {
    isLoading: boolean;
    incentivesDetails: Record<string, IncentiveDetails>;
}
