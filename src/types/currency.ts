export interface Currency {
  id: string;
  symbol: string;
  name: string;
  type: 'crypto' | 'fiat';
}

export interface ExchangeRate {
  [currency: string]: number;
}

export interface ConversionResult {
  currency: Currency;
  amount: number;
}

export interface TargetCurrency {
  id: string;
  currency: Currency;
}

