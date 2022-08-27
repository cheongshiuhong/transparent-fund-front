// Libraries
import { BigNumber } from '@ethersproject/bignumber';

/**
 * Util to strip the trailing zeros from a number string.
 *
 * @private
 * @param {string} numberAsString - The input number as a string.
 * @returns {string} - The stripped string.
 */
const _stripTrailingZeros = (numberAsString: string): string => {
    let numToStrip = 0;
    for (let i = numberAsString.length - 1; i >= 0; i--) {
        // Preserve minimum 1 decimal place
        if (numberAsString[i] == '.') {
            numToStrip--;
            break;
        }
        if (numberAsString[i] != '0') break;
        numToStrip++;
    }
    return numberAsString.slice(0, numberAsString.length - numToStrip);
};

/**
 * Util to format a big number as a decimal string.
 *
 * @param {BigNumber} number - The big number to be formatted.
 * @param {number} decimals - The number of decimals the big number is in.
 * @param {number} precision -The number of decimal places to show.
 * @returns {string} - The formatted decimal string.
 */
export default (number: BigNumber, decimals: number, precision: number): string => {
    const numPlacesToDivide = decimals - precision;
    const divisionFactor = BigNumber.from(10).pow(numPlacesToDivide);

    const result = number.div(divisionFactor).toString();
    const positionForPeriod = result.length - precision;

    if (positionForPeriod <= 0) {
        const correctedResult = '0.' + Array(-positionForPeriod).fill('0').join('') + result;
        return _stripTrailingZeros(correctedResult);
    }

    return _stripTrailingZeros(
        result.slice(0, positionForPeriod) + '.' + result.slice(positionForPeriod)
    );
};
