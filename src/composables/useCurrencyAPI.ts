import axios from 'axios';
import { ref, computed } from 'vue';
import type { Currency, ExchangeRate } from '../types/currency';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Popular currencies to show by default - naturally jumbled mix of fiat and crypto
const POPULAR_CURRENCIES = [
  'usd', 'eur', 'bitcoin', 'gbp', 'ethereum', 'jpy', 'tether', 'cad', 
  'binancecoin', 'aud', 'solana', 'chf', 'ripple', 'cny', 'usd-coin', 
  'inr', 'cardano', 'krw', 'dogecoin', 'tron'
];

export function useCurrencyAPI() {
  const currencies = ref<Currency[]>([]);
  const exchangeRates = ref<ExchangeRate>({});
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdated = ref<Date | null>(null);

  // Fetch available currencies (fiat and crypto)
  const fetchCurrencies = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      // Fetch top cryptocurrencies first
      const cryptoResponse = await axios.get(`${COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: false,
        },
        timeout: 10000,
      });

      const cryptoCurrencies: Currency[] = cryptoResponse.data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        type: 'crypto' as const,
      }));

      // Create a set of crypto IDs for quick lookup
      const cryptoIds = new Set(cryptoCurrencies.map(c => c.id));
      const cryptoSymbols = new Set(cryptoCurrencies.map(c => c.symbol));

      // Fetch supported vs currencies (this includes both fiat and some crypto)
      const vsResponse = await axios.get(`${COINGECKO_API}/simple/supported_vs_currencies`, {
        timeout: 10000,
      });
      
      // Filter out crypto from the vs_currencies list to get only fiat
      const fiatCurrencies: Currency[] = vsResponse.data
        .filter((code: string) => !cryptoIds.has(code) && !cryptoSymbols.has(code))
        .map((code: string) => ({
          id: code,
          symbol: code,
          name: code.toUpperCase(),
          type: 'fiat' as const,
        }));

      currencies.value = [...fiatCurrencies, ...cryptoCurrencies];
    } catch (err: any) {
      console.error('Error fetching currencies:', err);
      
      // Use fallback currencies if API fails
      const fallbackCurrencies: Currency[] = [
        // Major Fiat Currencies
        { id: 'usd', symbol: 'usd', name: 'US Dollar', type: 'fiat' },
        { id: 'eur', symbol: 'eur', name: 'Euro', type: 'fiat' },
        { id: 'gbp', symbol: 'gbp', name: 'British Pound', type: 'fiat' },
        { id: 'jpy', symbol: 'jpy', name: 'Japanese Yen', type: 'fiat' },
        { id: 'cad', symbol: 'cad', name: 'Canadian Dollar', type: 'fiat' },
        { id: 'aud', symbol: 'aud', name: 'Australian Dollar', type: 'fiat' },
        { id: 'chf', symbol: 'chf', name: 'Swiss Franc', type: 'fiat' },
        { id: 'cny', symbol: 'cny', name: 'Chinese Yuan', type: 'fiat' },
        { id: 'inr', symbol: 'inr', name: 'Indian Rupee', type: 'fiat' },
        { id: 'krw', symbol: 'krw', name: 'South Korean Won', type: 'fiat' },
        { id: 'brl', symbol: 'brl', name: 'Brazilian Real', type: 'fiat' },
        { id: 'mxn', symbol: 'mxn', name: 'Mexican Peso', type: 'fiat' },
        { id: 'rub', symbol: 'rub', name: 'Russian Ruble', type: 'fiat' },
        { id: 'zar', symbol: 'zar', name: 'South African Rand', type: 'fiat' },
        { id: 'sgd', symbol: 'sgd', name: 'Singapore Dollar', type: 'fiat' },
        { id: 'hkd', symbol: 'hkd', name: 'Hong Kong Dollar', type: 'fiat' },
        { id: 'nzd', symbol: 'nzd', name: 'New Zealand Dollar', type: 'fiat' },
        { id: 'sek', symbol: 'sek', name: 'Swedish Krona', type: 'fiat' },
        { id: 'nok', symbol: 'nok', name: 'Norwegian Krone', type: 'fiat' },
        { id: 'dkk', symbol: 'dkk', name: 'Danish Krone', type: 'fiat' },
        { id: 'pln', symbol: 'pln', name: 'Polish Zloty', type: 'fiat' },
        { id: 'thb', symbol: 'thb', name: 'Thai Baht', type: 'fiat' },
        { id: 'try', symbol: 'try', name: 'Turkish Lira', type: 'fiat' },
        { id: 'idr', symbol: 'idr', name: 'Indonesian Rupiah', type: 'fiat' },
        { id: 'aed', symbol: 'aed', name: 'UAE Dirham', type: 'fiat' },
        { id: 'sar', symbol: 'sar', name: 'Saudi Riyal', type: 'fiat' },
        // Top Cryptocurrencies
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', type: 'crypto' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum', type: 'crypto' },
        { id: 'tether', symbol: 'usdt', name: 'Tether', type: 'crypto' },
        { id: 'binancecoin', symbol: 'bnb', name: 'BNB', type: 'crypto' },
        { id: 'solana', symbol: 'sol', name: 'Solana', type: 'crypto' },
        { id: 'ripple', symbol: 'xrp', name: 'XRP', type: 'crypto' },
        { id: 'usd-coin', symbol: 'usdc', name: 'USD Coin', type: 'crypto' },
        { id: 'cardano', symbol: 'ada', name: 'Cardano', type: 'crypto' },
        { id: 'dogecoin', symbol: 'doge', name: 'Dogecoin', type: 'crypto' },
        { id: 'tron', symbol: 'trx', name: 'TRON', type: 'crypto' },
        { id: 'polkadot', symbol: 'dot', name: 'Polkadot', type: 'crypto' },
        { id: 'polygon', symbol: 'matic', name: 'Polygon', type: 'crypto' },
        { id: 'litecoin', symbol: 'ltc', name: 'Litecoin', type: 'crypto' },
        { id: 'chainlink', symbol: 'link', name: 'Chainlink', type: 'crypto' },
        { id: 'avalanche-2', symbol: 'avax', name: 'Avalanche', type: 'crypto' },
      ];
      
      currencies.value = fallbackCurrencies;
      error.value = 'Using cached currencies. ' + (err.response?.status === 429 ? 'API rate limit reached.' : 'Unable to fetch live data.');
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch exchange rates for specific currencies
  const fetchExchangeRates = async (baseCurrency: string, targetCurrencies: string[]) => {
    if (targetCurrencies.length === 0) {
      exchangeRates.value = {};
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      // Find the base currency to determine if it's crypto or fiat
      const baseCurrencyObj = currencies.value.find(c => c.id === baseCurrency || c.symbol === baseCurrency);
      
      if (!baseCurrencyObj) {
        throw new Error('Base currency not found');
      }

      let rates: ExchangeRate = {};

      if (baseCurrencyObj.type === 'crypto') {
        // For crypto base, use the coin price endpoint
        const response = await axios.get(`${COINGECKO_API}/simple/price`, {
          params: {
            ids: baseCurrency,
            vs_currencies: targetCurrencies.join(','),
          },
          timeout: 10000,
        });

        rates = response.data[baseCurrency] || {};
      } else {
        // For fiat base, we need to get 1/rate for each target
        // Get all crypto targets priced in the base fiat
        const cryptoTargets = targetCurrencies.filter(tc => {
          const curr = currencies.value.find(c => c.id === tc || c.symbol === tc);
          return curr?.type === 'crypto';
        });

        const fiatTargets = targetCurrencies.filter(tc => {
          const curr = currencies.value.find(c => c.id === tc || c.symbol === tc);
          return curr?.type === 'fiat';
        });

        // Get crypto prices in base fiat and invert the rate
        if (cryptoTargets.length > 0) {
          const cryptoResponse = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
              ids: cryptoTargets.join(','),
              vs_currencies: baseCurrency,
            },
            timeout: 10000,
          });

          Object.keys(cryptoResponse.data).forEach(coinId => {
            const price = cryptoResponse.data[coinId][baseCurrency];
            if (price) {
              // Invert the rate: if 1 BTC = 90773 USD, then 1 USD = 1/90773 BTC
              rates[coinId] = 1 / price;
            }
          });
        }

        // Get fiat to fiat conversion using USD as intermediate
        if (fiatTargets.length > 0) {
          // Use Bitcoin as a reference to get fiat exchange rates
          const btcResponse = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
              ids: 'bitcoin',
              vs_currencies: [baseCurrency, ...fiatTargets].join(','),
            },
            timeout: 10000,
          });

          const btcRates = btcResponse.data.bitcoin;
          const baseRate = btcRates[baseCurrency];

          fiatTargets.forEach(targetFiat => {
            if (targetFiat === baseCurrency) {
              rates[targetFiat] = 1;
            } else {
              const targetRate = btcRates[targetFiat];
              if (baseRate && targetRate) {
                rates[targetFiat] = targetRate / baseRate;
              }
            }
          });
        }
      }

      exchangeRates.value = rates;
      lastUpdated.value = new Date();
    } catch (err: any) {
      console.error('Error fetching exchange rates:', err);
      // Don't set error here - just log it. Keep previous rates if available.
      if (Object.keys(exchangeRates.value).length === 0) {
        error.value = 'Unable to fetch exchange rates. ' + (err.response?.status === 429 ? 'API rate limit reached.' : 'Please try again later.');
      }
    } finally {
      isLoading.value = false;
    }
  };

  // Get popular currencies in the order defined in POPULAR_CURRENCIES
  const popularCurrencies = computed(() => {
    return POPULAR_CURRENCIES
      .map(id => currencies.value.find(c => c.id === id || c.symbol === id))
      .filter((c): c is Currency => c !== undefined);
  });

  // Get crypto currencies
  const cryptoCurrencies = computed(() => {
    return currencies.value.filter(c => c.type === 'crypto');
  });

  // Get fiat currencies
  const fiatCurrencies = computed(() => {
    return currencies.value.filter(c => c.type === 'fiat');
  });

  return {
    currencies,
    exchangeRates,
    isLoading,
    error,
    lastUpdated,
    popularCurrencies,
    cryptoCurrencies,
    fiatCurrencies,
    fetchCurrencies,
    fetchExchangeRates,
  };
}

