// Libraries
import { BigNumber } from '@ethersproject/bignumber';

export default (number: BigNumber, decimalsIn: number, decimalsOut: number): BigNumber => {
    if (decimalsIn > decimalsOut) {
        return number.div(BigNumber.from(10).pow(decimalsIn - decimalsOut));
    }

    return number.mul(BigNumber.from(10).pow(decimalsOut - decimalsIn));
};
