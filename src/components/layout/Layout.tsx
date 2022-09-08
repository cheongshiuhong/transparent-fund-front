// Types
import type { FC, ReactElement } from 'react';
import type { WrapperProps } from '@interfaces/general';

// Libraries
// import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useMedia } from 'react-use-media';
import Drawer from 'react-modern-drawer';
import { BigNumber } from '@ethersproject/bignumber';

// Styles
import 'react-modern-drawer/dist/index.css';

// Contexts
import { useWeb3Context } from '@contexts/web3';
import { useFundContext } from '@contexts/fund';

// Code
import useRouter from '@hooks/useRouter';
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';

// Icons
// import { AiOutlineBarChart } from 'react-icons/ai';
import { MdOutlineChat } from 'react-icons/md';
import { FiGift } from 'react-icons/fi';

// Constants
const DATE_LAUNCHED = new Date('2022-08-28');
const WORKING_DECIMALS = 6;
const ROUTES = [
    // { path: '/', label: 'Dashboard', matches: ['/'], Icon: AiOutlineBarChart },
    { path: '/requests', label: 'Requests', matches: ['/requests'], Icon: MdOutlineChat },
    {
        path: '/incentives',
        label: 'Incentives',
        matches: ['/incentives', '/incentives/[address]'],
        Icon: FiGift
    }
];

const computeDailyReturns = (tokenPrice: BigNumber): BigNumber => {
    const initialTokenPrice = BigNumber.from(10).pow(18);
    const daysFromLaunch = Math.floor((Date.now() - DATE_LAUNCHED.getTime()) / (86400 * 1000));
    const dailyReturns = tokenPrice
        .mul(BigNumber.from(10).pow(WORKING_DECIMALS))
        .div(initialTokenPrice)
        .sub(BigNumber.from(10).pow(WORKING_DECIMALS))
        .div(daysFromLaunch);
    return dailyReturns;
};

const computeAnnualizedReturns = (tokenPrice: BigNumber): number => {
    const dailyReturns = computeDailyReturns(tokenPrice).toNumber() / 10 ** WORKING_DECIMALS;
    return Math.round(((1 + dailyReturns) ** 365 - 1) * 100 * 1000) / 1000;
};

/**
 * The layout component.
 *
 * @param {WrapperProps} props - The children to wrap.
 * @returns {ReactElement} - The wrapped children with layout.
 */
const Layout: FC<WrapperProps> = ({ children }: WrapperProps): ReactElement => {
    const { currentPath } = useRouter();
    const { connectWallet, userAddress } = useWeb3Context();
    const {
        fundState: { aumValue, fundTokenPrice, actualSupply, theoreticalSupply }
    } = useFundContext();
    const isLarge = useMedia({ minWidth: 1024 });
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const moneyFormatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        minimumFractionDigits: 3
    });
    // const supplyFormatter = new Intl.NumberFormat('en-US', {
    //     notation: 'compact',
    //     minimumFractionDigits: 3
    // });

    return (
        <div className="max-h-screen max-w-screen overflow-x-hidden overflow-y-auto">
            {/* Sidebar drawer */}
            <Drawer
                open={isLarge || isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                direction="left"
                size="224px"
                className="py-6 bg-white"
                enableOverlay={!isLarge}>
                {/* Logo */}
                <div className="mt-2 ml-4 text-sm">
                    {/* <p>
                        <span className="font-semibold">AUM Value:</span>&nbsp;
                        <span>
                            {aumValue &&
                                moneyFormatter.format(
                                    Number(bigNumberToDecimalString(aumValue, 18, 4))
                                )}
                        </span>
                    </p> */}
                    {/* <p>
                        <span className="font-semibold">Total Supply:</span>&nbsp;
                        {actualSupply &&
                            supplyFormatter.format(
                                Number(bigNumberToDecimalString(actualSupply, 18, 4))
                            )}
                    </p> */}
                    <p>
                        <span className="font-semibold">Token Price:</span>&nbsp;
                        {fundTokenPrice &&
                            moneyFormatter.format(
                                Number(bigNumberToDecimalString(fundTokenPrice, 18, 4))
                            )}
                    </p>
                    <p>
                        <span className="font-semibold">Annual Returns:</span>&nbsp;
                        {fundTokenPrice && <>{computeAnnualizedReturns(fundTokenPrice)}%</>}
                    </p>
                </div>
                {/* Navigations */}
                <nav className="mt-10">
                    <ul className="space-y-1">
                        {ROUTES.map(({ path, label, matches, Icon }) => (
                            <Link key={path} href={path}>
                                <li
                                    className={`h-14 w-full flex items-center justify-start px-6 space-x-2 border-l-4
                                    ${
                                        matches.includes(currentPath)
                                            ? 'bg-gray-300 border-blue-400 text-gray-800'
                                            : 'text-gray-500'
                                    } cursor-pointer hover:bg-gray-200 hover:border-gray-2`}>
                                    <Icon size={20} />
                                    <span className="text-base font-semibold">&nbsp;{label}</span>
                                </li>
                            </Link>
                        ))}
                    </ul>
                </nav>
            </Drawer>

            <div className={`${isLarge ? 'ml-[224px]' : 'ml-0'}`}>
                {/* Top bar */}
                <div
                    style={{ height: isLarge ? '96px' : '64px' }}
                    className="sticky top-0 w-full px-4 sm:px-8 lg:px-12
                    flex items-center justify-between bg-white-300">
                    {/* Drawer button / Page title*/}
                    {!isLarge && (
                        <div className="">
                            <svg
                                onClick={() => setIsDrawerOpen(true)}
                                className="flex items-center cursor-pointer"
                                fill="#2563EB"
                                viewBox="0 0 100 80"
                                width="24"
                                height="24">
                                <rect width="100" height="10"></rect>
                                <rect y="30" width="100" height="10"></rect>
                                <rect y="60" width="100" height="10"></rect>
                            </svg>
                        </div>
                    )}
                    {/* Logo */}
                    <div className="flex items-center justify-center">
                        {/* <p className="text-base lg:text-xl font-semibold text-gray-800">Logo</p> */}
                        {/* <Image src="/translucent_logo.png" width={120} height={120} /> */}
                    </div>
                    {/* Wallet */}
                    <div className="flex items-center justify-end">
                        {userAddress ? (
                            <button
                                disabled
                                className="px-5 py-1.5 text-sm md:text-base lg:text-lg bg-blue-400 text-white rounded-full shadow-lg">
                                {userAddress.slice(0, 10)}&hellip;
                            </button>
                        ) : (
                            <button
                                onClick={connectWallet}
                                className="px-5 py-1.5 text-sm md:text-base lg:text-lg bg-blue-400 text-white rounded-full shadow-lg">
                                Connect Wallet
                            </button>
                        )}
                    </div>
                </div>
                {/* Content */}
                <div
                    style={{ height: isLarge ? 'calc(100vh - 96px)' : 'calc(100vh - 64px)' }}
                    className="w-full px-4 sm:px-8 lg:px-12">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
