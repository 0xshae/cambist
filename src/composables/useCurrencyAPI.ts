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
      // Fetch supported fiat currencies with timeout
      const fiatResponse = await axios.get(`${COINGECKO_API}/simple/supported_vs_currencies`, {
        timeout: 10000,
      });
      const fiatCurrencies: Currency[] = fiatResponse.data.map((code: string) => ({
        id: code,
        symbol: code,
        name: code.toUpperCase(),
        type: 'fiat' as const,
      }));

      // Fetch top cryptocurrencies with timeout
      const cryptoResponse = await axios.get(`${COINGECKO_API}/coins/markets`, {
        params: {
          vs_currency: 'usd',
          order: 'market_cap_desc',
          per_page: 50,
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

      currencies.value = [...fiatCurrencies, ...cryptoCurrencies];
    } catch (err: any) {
      console.error('Error fetching currencies:', err);
      
      // Use fallback currencies if API fails
      const fallbackCurrencies: Currency[] = [
        { id: 'usd', symbol: 'usd', name: 'US Dollar', type: 'fiat' },
        { id: 'eur', symbol: 'eur', name: 'Euro', type: 'fiat' },
        { id: 'gbp', symbol: 'gbp', name: 'British Pound', type: 'fiat' },
        { id: 'jpy', symbol: 'jpy', name: 'Japanese Yen', type: 'fiat' },
        { id: 'cad', symbol: 'cad', name: 'Canadian Dollar', type: 'fiat' },
        { id: 'aud', symbol: 'aud', name: 'Australian Dollar', type: 'fiat' },
        { id: 'chf', symbol: 'chf', name: 'Swiss Franc', type: 'fiat' },
        { id: 'cny', symbol: 'cny', name: 'Chinese Yuan', type: 'fiat' },
        { id: 'inr', symbol: 'inr', name: 'Indian Rupee', type: 'fiat' },
        { id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', type: 'crypto' },
        { id: 'ethereum', symbol: 'eth', name: 'Ethereum', type: 'crypto' },
        { id: 'tether', symbol: 'usdt', name: 'Tether', type: 'crypto' },
        { id: 'binancecoin', symbol: 'bnb', name: 'BNB', type: 'crypto' },
        { id: 'solana', symbol: 'sol', name: 'Solana', type: 'crypto' },
        { id: 'ripple', symbol: 'xrp', name: 'XRP', type: 'crypto' },
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
        // For crypto base, separate fiat and crypto targets
        const cryptoTargets = targetCurrencies.filter(tc => {
          const curr = currencies.value.find(c => c.id === tc || c.symbol === tc);
          return curr?.type === 'crypto';
        });

        const fiatTargets = targetCurrencies.filter(tc => {
          const curr = currencies.value.find(c => c.id === tc || c.symbol === tc);
          return curr?.type === 'fiat';
        });

        // Get crypto to fiat rates directly
        if (fiatTargets.length > 0) {
          const fiatResponse = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
              ids: baseCurrency,
              vs_currencies: fiatTargets.join(','),
            },
            timeout: 10000,
          });

          const fiatRates = fiatResponse.data[baseCurrency] || {};
          Object.keys(fiatRates).forEach(fiatId => {
            rates[fiatId] = fiatRates[fiatId];
          });
        }

        // For crypto to crypto, use USD as intermediary
        if (cryptoTargets.length > 0) {
          // Get base crypto price in USD
          const baseResponse = await axios.get(`${COINGECKO_API}/simple/price`, {
            params: {
              ids: baseCurrency,
              vs_currencies: 'usd',
            },
            timeout: 10000,
          });

          const baseUsdPrice = baseResponse.data[baseCurrency]?.usd;

          if (baseUsdPrice) {
            // Get target crypto prices in USD
            const targetResponse = await axios.get(`${COINGECKO_API}/simple/price`, {
              params: {
                ids: cryptoTargets.join(','),
                vs_currencies: 'usd',
              },
              timeout: 10000,
            });

            // Calculate crypto-to-crypto rate via USD
            cryptoTargets.forEach(targetCrypto => {
              const targetUsdPrice = targetResponse.data[targetCrypto]?.usd;
              if (targetUsdPrice) {
                // How much target crypto for 1 base crypto
                rates[targetCrypto] = baseUsdPrice / targetUsdPrice;
              }
            });
          }
        }
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
            timeout: 10000,
          });

          Object.keys(cryptoResponse.data).forEach(coinId => {
            const price = cryptoResponse.data[coinId][baseCurrency];
            if (price) {
              // Price is "how much fiat for 1 crypto"
              // But we need "how much crypto for 1 fiat"
              // So we invert: 1 / price
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

