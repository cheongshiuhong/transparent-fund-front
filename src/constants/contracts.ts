// Libraries
import { ethers } from 'ethers';

// Constants
import addresses from './addresses';

// ABIs
import AccountingABI from '@abis/Accounting.json';
import FrontOfficeABI from '@abis/FrontOffice.json';
import FrontOfficeParametersABI from '@abis/FrontOfficeParameters.json';
import FundTokenABI from '@abis/FundToken.json';
import IncentivesManagerABI from '@abis/IncentivesManager.json';
import IIncentiveABI from '@abis/incentives/IIncentive.json';
import ReferralIncentiveABI from '@abis/incentives/ReferralIncentive.json';
import ERC20ABI from '@abis/ERC20.json';
import ChainlinkOracleABI from '@abis/ChainlinkOracle.json';

export default {
    // Address-specific contracts
    accounting: new ethers.Contract(addresses.accounting, AccountingABI),
    frontOffice: new ethers.Contract(addresses.frontOffice, FrontOfficeABI),
    frontOfficeParameters: new ethers.Contract(
        addresses.frontOfficeParameters,
        FrontOfficeParametersABI
    ),
    incentivesManager: new ethers.Contract(addresses.incentivesManager, IncentivesManagerABI),
    fundToken: new ethers.Contract(addresses.fundToken, FundTokenABI),

    referralIncentive: new ethers.Contract(addresses.referralIncentive, ReferralIncentiveABI),

    // Generic contracts
    iIncentive: new ethers.Contract(ethers.constants.AddressZero, IIncentiveABI),
    erc20: new ethers.Contract(ethers.constants.AddressZero, ERC20ABI),
    chainlinkOracle: new ethers.Contract(ethers.constants.AddressZero, ChainlinkOracleABI)
};
