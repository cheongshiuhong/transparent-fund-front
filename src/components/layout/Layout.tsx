// Types
import type { FC, ReactElement } from 'react';
import type { WrapperProps } from '@interfaces/general';

// Libraries
// import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useMedia } from 'react-use-media';
import Drawer from 'react-modern-drawer';

// Styles
import 'react-modern-drawer/dist/index.css';

// Contexts
import { useWeb3Context } from '@contexts/web3';
import { useFundContext } from '@contexts/fund';

// Code
import useRouter from '@hooks/useRouter';
import bigNumberToDecimalString from '@utils/numbers/bigNumberToDecimalString';

// Icons
import { AiOutlineBarChart } from 'react-icons/ai';
import { MdOutlineChat } from 'react-icons/md';
import { FiGift } from 'react-icons/fi';

const routes = [
    { path: '/', label: 'Dashboard', matches: ['/'], Icon: AiOutlineBarChart },
    { path: '/requests', label: 'Requests', matches: ['/requests'], Icon: MdOutlineChat },
    {
        path: '/incentives',
        label: 'Incentives',
        matches: ['/incentives', '/incentives/[address]'],
        Icon: FiGift
    }
];

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
                <div className="">
                    AUM Value: {aumValue && bigNumberToDecimalString(aumValue, 18, 4)}
                    <br />
                    Fund Token Price:
                    {fundTokenPrice && bigNumberToDecimalString(fundTokenPrice, 18, 4)}
                    <br />
                    Actual Supply:
                    {fundTokenPrice && bigNumberToDecimalString(actualSupply, 18, 4)}
                    <br />
                    Theore Supply:
                    {fundTokenPrice && bigNumberToDecimalString(theoreticalSupply, 18, 4)}
                    {/* <Image src="/translucent.png" height={200} width={500} /> */}
                </div>
                {/* Navigations */}
                <nav className="mt-12">
                    <ul className="space-y-1">
                        {routes.map(({ path, label, matches, Icon }) => (
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
                        <p className="text-base lg:text-xl font-semibold text-gray-800">Logo</p>
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

            {/* <>
                {isSidebarOpen ? (
                    <button
                    className="flex text-4xl text-white items-center cursor-pointer fixed right-10 top-6 z-50"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                    x
                    </button>
                ) : (
                    <svg
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="fixed z-30 flex items-center cursor-pointer right-10 top-6"
                        fill="#2563EB"
                        viewBox="0 0 100 80"
                        width="40"
                        height="40">
                        <rect width="100" height="10"></rect>
                        <rect y="30" width="100" height="10"></rect>
                        <rect y="60" width="100" height="10"></rect>
                    </svg>
                )}
                <div
                    className={`top-0 left-0 w-56 bg-blue-600 p-10 pl-20 text-white fixed h-full z-40 ease-in-out duration-300
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <h3 className="mt-20 text-4xl font-semibold text-white">I am a sidebar</h3>
                </div>
            </> */}
            {/* Large screen sidebar */}
            {/* <div className="h-screen w-56 overflow-y-auto bg-white-100 py-8"> */}
            {/* Logo */}
            {/* <div>
                Logo
            </div> */}
            {/* Navigations */}
            {/* <nav className="mt-12">
                <ul className="space-y-1">
                    {routes.map(({ path, label, Icon }) => (
                        <Link href={path}>
                            <li
                                className={`h-14 w-full flex items-center justify-start px-6 space-x-2 border-l-4
                                ${path === currentPath
                                    ? 'bg-gray-300 border-blue-400 text-gray-800'
                                    : 'text-gray-500'
                                } cursor-pointer hover:bg-gray-200 hover:border-gray-2`}>
                                <Icon size={20} />
                                <span className="text-base font-semibold">
                                    &nbsp;{label}
                                </span>
                            </li>
                        </Link>
                    ))}
                </ul>
            </nav> */}
            {/* </div> */}
            {/* Appbar */}
        </div>
    );
};

export default Layout;

// {/* Header */}
// <div
//                 className="fixed top-0 h-16 w-screen flex items-center justify-between
//                 px-6 sm:px-10 md:px-20 z-20 shadow-md
//                 bg-white">
//                 {/* Title */}
//                 <div className="w-1/2 flex items-center justify-start">
//                     <button
//                         onClick={() => redirect('/')}
//                         className="px-4 py-2 text-sm md:text-base lg:text-lg xl:text-xl font-semibold text-palette-dark-gray">
//                         Transparent Fund
//                     </button>
//                 </div>
//                 {/* Navigation */}
//                 {/* Wallet */}
//                 <div className="w-1/2 flex items-center justify-end">
//                     {userAddress ? (
//                         <button
//                             disabled
//                             className="px-3 py-1.5 text-xs md:text-sm lg:text-base bg-palette-dark-gray text-white rounded-full shadow-lg">
//                             {userAddress.slice(0, 10)}&hellip;
//                         </button>
//                     ) : (
//                         <button
//                             onClick={connectWallet}
//                             className="px-3 py-1.5 text-xs md:text-sm lg:text-base bg-palette-dark-gray text-white rounded-full shadow-lg">
//                             Connect Wallet
//                         </button>
//                     )}
//                 </div>
//             </div>

//             <div className="w-screen flex items-center justify-between pt-24 mx-auto mb-16 px-6 sm:px-10 md:px-20">
// <div className="h-10 w-10 bg-palette-dark-gray">Box</div>
// <div className="h-10 w-10 bg-palette-light-gray">Box</div>
// <div className="h-10 w-10 bg-palette-orange">Box</div>
// <div className="h-10 w-10 bg-palette-yellow">Box</div>
// <div className="h-10 w-10 bg-palette-green">Box</div>
//                 {children}
//             </div>
