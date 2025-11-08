export function normalizeCurrency(input: string): string {
  if (!input) return input;
  const before = {
    dollar: (input.match(/\$/g) || []).length,
    rupeeSym: (input.match(/[₹]/g) || []).length,
    rsWord: (input.match(/\b(?:Rs\.?|INR)\b/gi) || []).length,
    usdWord: (input.match(/\bUSD\b/gi) || []).length,
  };
  let out = input
    .replace(/\$/g, '£')
    .replace(/[₹]/g, '£')
    .replace(/\bRs\.?\b/gi, '£')
    .replace(/\bINR\b/gi, '£')
    .replace(/\bUSD\b/gi, '£');
  const after = (out.match(/£/g) || []).length;
  // Debug: how many replacements likely occurred
  // Using console.debug so it’s quiet unless dev tools are open
  // eslint-disable-next-line no-console
  console.debug('[currency-normalize]', { before, poundCount: after });
  return out;
}












