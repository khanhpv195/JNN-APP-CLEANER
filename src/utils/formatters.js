/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
    if (amount === undefined || amount === null) return 'N/A';

    // Convert to dollars if in cents (amount > 100 is a heuristic)
    const value = amount > 100 ? amount / 100 : amount;

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(value);
}; 