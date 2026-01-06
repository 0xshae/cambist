import { ref, computed, watch } from 'vue';
import type { Currency, TargetCurrency, ConversionResult } from '../types/currency';
import { useLocalStorage } from './useLocalStorage';
import { useCurrencyAPI } from './useCurrencyAPI';

const MAX_TARGETS = 10;

export function useConverter() {
  const {
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
  } = useCurrencyAPI();

  // Persistent state
  const sourceCurrencyId = useLocalStorage<string>('source_currency', 'usd');
  const sourceAmount = useLocalStorage<number>('source_amount', 100);
  const targetCurrencyIds = useLocalStorage<string[]>('target_currencies', ['eur', 'gbp', 'bitcoin']);

  // Local state
  const targetCurrencies = ref<TargetCurrency[]>([]);

  // Computed properties
  const sourceCurrency = computed(() => {
    return currencies.value.find(c => c.id === sourceCurrencyId.value) || null;
  });

  const canAddMoreTargets = computed(() => {
    return targetCurrencies.value.length < MAX_TARGETS;
  });

  const conversions = computed<ConversionResult[]>(() => {
    if (!sourceCurrency.value || sourceAmount.value <= 0) {
      return [];
    }

    return targetCurrencies.value.map(target => {
      const rate = exchangeRates.value[target.currency.id] || 0;
      const amount = sourceAmount.value * rate;

      return {
        currency: target.currency,
        amount,
      };
    });
  });

  // Initialize target currencies from stored IDs
  const initializeTargets = () => {
    if (currencies.value.length === 0) return;

    targetCurrencies.value = targetCurrencyIds.value
      .map(id => {
        const currency = currencies.value.find(c => c.id === id);
        if (currency) {
          return {
            id: `target-${id}-${Date.now()}`,
            currency,
          };
        }
        return null;
      })
      .filter((t): t is TargetCurrency => t !== null);
  };

  // Watch for changes in target currencies and update localStorage
  watch(targetCurrencies, (newTargets) => {
    targetCurrencyIds.value = newTargets.map(t => t.currency.id);
  }, { deep: true });

  // Add a target currency
  const addTarget = (currency: Currency) => {
    if (!canAddMoreTargets.value) {
      return false;
    }

    // Check if currency is already added
    const exists = targetCurrencies.value.some(t => t.currency.id === currency.id);
    if (exists) {
      return false;
    }

    // Check if it's the same as source
    if (currency.id === sourceCurrencyId.value) {
      return false;
    }

    targetCurrencies.value.push({
      id: `target-${currency.id}-${Date.now()}`,
      currency,
    });

    return true;
  };

  // Remove a target currency
  const removeTarget = (targetId: string) => {
    const index = targetCurrencies.value.findIndex(t => t.id === targetId);
    if (index !== -1) {
      targetCurrencies.value.splice(index, 1);
    }
  };

  // Swap source with a target currency
  const swapCurrency = (targetId: string) => {
    const targetIndex = targetCurrencies.value.findIndex(t => t.id === targetId);
    if (targetIndex === -1 || !sourceCurrency.value) {
      return;
    }

    const target = targetCurrencies.value[targetIndex];
    if (!target) {
      return;
    }

    const oldSource = sourceCurrency.value;
    const newSource = target.currency;

    // Set new source
    sourceCurrencyId.value = newSource.id;

    // Create a new target object with the old source currency
    // This ensures Vue's reactivity properly detects the change
    targetCurrencies.value[targetIndex] = {
      id: `target-${oldSource.id}-${Date.now()}`,
      currency: oldSource,
    };
  };

  // Update source amount
  const updateAmount = (amount: number) => {
    sourceAmount.value = Math.max(0, amount);
  };

  // Update source currency
  const updateSourceCurrency = (currencyId: string) => {
    // Remove from targets if it exists
    const targetIndex = targetCurrencies.value.findIndex(t => t.currency.id === currencyId);
    if (targetIndex !== -1) {
      targetCurrencies.value.splice(targetIndex, 1);
    }

    sourceCurrencyId.value = currencyId;
  };

  // Refresh exchange rates
  const refreshRates = async () => {
    if (!sourceCurrencyId.value) return;

    const targetIds = targetCurrencies.value.map(t => t.currency.id);
    await fetchExchangeRates(sourceCurrencyId.value, targetIds);
  };

  // Watch for changes in source or targets and fetch rates
  watch([sourceCurrencyId, targetCurrencies], async () => {
    await refreshRates();
  }, { deep: true });

  // Watch for currencies loaded and initialize targets
  watch(currencies, () => {
    initializeTargets();
  });

  return {
    // State
    sourceCurrency,
    sourceAmount,
    targetCurrencies,
    conversions,
    currencies,
    exchangeRates,
    isLoading,
    error,
    lastUpdated,
    popularCurrencies,
    cryptoCurrencies,
    fiatCurrencies,
    canAddMoreTargets,
    
    // Methods
    addTarget,
    removeTarget,
    swapCurrency,
    updateAmount,
    updateSourceCurrency,
    fetchCurrencies,
    refreshRates,
  };
}

