/**
 * Sets timeout.
 *
 * @param {number} ms - The ms to sleep.
 * @returns {Promise<void>} - The timer.
 */
export default (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
