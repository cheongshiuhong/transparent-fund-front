// Libraries
import { ethers } from 'ethers';

export default {
    accounting: process.env.NEXT_PUBLIC_ACCOUNTING_ADDRESS || ethers.constants.AddressZero,
    frontOffice: process.env.NEXT_PUBLIC_FRONT_OFFICE_ADDRESS || ethers.constants.AddressZero,
    frontOfficeParameters:
        process.env.NEXT_PUBLIC_FRONT_OFFICE_PARAMETERS_ADDRESS || ethers.constants.AddressZero,
    fundToken: process.env.NEXT_PUBLIC_FUND_TOKEN_ADDRESS || ethers.constants.AddressZero,
    incentivesManager:
        process.env.NEXT_PUBLIC_INCENTIVES_MANAGER_ADDRESS || ethers.constants.AddressZero,

    // Explicitly specified incentives
    referralIncentive:
        process.env.NEXT_PUBLIC_REFERRAL_INCENTIVE_ADDRESS || ethers.constants.AddressZero
};
