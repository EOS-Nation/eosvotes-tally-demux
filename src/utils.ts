/**
 * Parse Token String
 *
 * @param {string} tokenString Token String (eg: "10.0 EOS")
 * @returns {object} Amount & Symbol
 * @example
 * parseTokenString("10.0 EOS") //=> {amount: 10.0, symbol: "EOS"}
 */
export function parseTokenString(tokenString: string) {
    const [amountString, symbol] = tokenString.split(" ")
    const amount = parseFloat(amountString)
    return {amount, symbol}
}
