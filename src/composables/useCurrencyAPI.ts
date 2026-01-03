import axios from 'axios';
import { ref, computed } from 'vue';
import type { Currency, ExchangeRate } from '../types/currency';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Popular currencies to show at the top
const POPULAR_CURRENCIES = ['usd', 'eur', 'gbp', 'btc', 'eth', 'usdt', 'bnb'];

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
      // Fetch supported fiat currencies
      const fiatResponse = await axios.get(`${COINGECKO_API}/simple/supported_vs_currencies`);
      const fiatCurrencies: Currency[] = fiatResponse.data.map((code: string) => ({
        id: code,
        symbol: code,
        name: code.toUpperCase(),
        type: 'fiat' as const,
      }));

      // Fetch top cryptocurrencies
      const cryptoResponse = await axios.get(`${COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 100,
          page: 1,
          sparkline: false,
        },
      });

      const cryptoCurrencies: Currency[] = cryptoResponse.data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol,
        name: coin.name,
        type: 'crypto' as const,
      }));

      currencies.value = [...fiatCurrencies, ...cryptoCurrencies];
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch currencies';
      console.error('Error fetching currencies:', err);
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

        // Get crypto prices in base fiat
        if (cryptoTargets.length > 0) {
          const cryptoResponse = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
              ids: cryptoTargets.join(','),
              vs_currencies: baseCurrency,
            },
          });

          Object.keys(cryptoResponse.data).forEach(coinId => {
            const price = cryptoResponse.data[coinId][baseCurrency];
            if (price) {
              rates[coinId] = price;
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
      error.value = err.message || 'Failed to fetch exchange rates';
      console.error('Error fetching exchange rates:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Get popular currencies
  const popularCurrencies = computed(() => {
    return currencies.value.filter(c => POPULAR_CURRENCIES.includes(c.id) || POPULAR_CURRENCIES.includes(c.symbol));
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

