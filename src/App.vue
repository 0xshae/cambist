<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <DollarSign :size="32" class="text-blue-600" />
            <h1 class="text-3xl font-bold text-gray-900">Currency Converter</h1>
          </div>
          <div class="flex items-center space-x-4">
            <button
              @click="handleRefresh"
              :disabled="isLoading"
              class="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors disabled:opacity-50"
              title="Refresh rates"
            >
              <RefreshCw :size="20" :class="{ 'animate-spin': isLoading }" />
              <span class="hidden sm:inline">Refresh</span>
            </button>
            <div v-if="lastUpdated" class="text-sm text-gray-500">
              Updated: {{ formatTime(lastUpdated) }}
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading state -->
      <div v-if="initialLoading" class="text-center py-12">
        <RefreshCw :size="48" class="animate-spin mx-auto text-blue-600 mb-4" />
        <p class="text-gray-600">Loading currencies...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex items-start space-x-3">
          <AlertCircle :size="24" class="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 class="font-semibold text-red-900">Error</h3>
            <p class="text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Converter interface -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Source currency -->
        <SourceCurrencyInput
          :model-value="sourceAmount"
          :selected-currency="sourceCurrency"
          :currencies="currencies"
          :popular-currencies="popularCurrencies"
          :crypto-currencies="cryptoCurrencies"
          :fiat-currencies="fiatCurrencies"
          :disabled-currencies="disabledCurrencyIds"
          @update:model-value="updateAmount"
          @update:selected-currency="handleUpdateSourceCurrency"
        />

        <!-- Target currencies -->
        <TargetCurrencyList
          :target-currencies="targetCurrencies"
          :conversions="conversions"
          :can-add-more="canAddMore"
          :max-targets="10"
          :is-loading="isLoading"
          @add="showAddCurrency = true"
          @remove="removeTarget"
          @swap="swapCurrency"
        />
      </div>

      <!-- Info section -->
      <div class="mt-8 bg-white rounded-xl shadow-lg p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">About This Converter</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">One-to-Many Conversion</h3>
            <p>Convert one source currency to multiple target currencies simultaneously.</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Crypto & Fiat</h3>
            <p>Support for both cryptocurrency and traditional fiat currencies.</p>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900 mb-2">Real-time Rates</h3>
            <p>Exchange rates powered by CoinGecko API with auto-refresh.</p>
          </div>
        </div>
      </div>
    </main>

    <!-- Add currency modal -->
    <CurrencySelector
      :is-open="showAddCurrency"
      :currencies="currencies"
      :popular-currencies="popularCurrencies"
      :crypto-currencies="cryptoCurrencies"
      :fiat-currencies="fiatCurrencies"
      :disabled-currencies="disabledCurrencyIds"
      @close="showAddCurrency = false"
      @select="handleAddCurrency"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { DollarSign, RefreshCw, AlertCircle } from 'lucide-vue-next';
import SourceCurrencyInput from './components/SourceCurrencyInput.vue';
import TargetCurrencyList from './components/TargetCurrencyList.vue';
import CurrencySelector from './components/CurrencySelector.vue';
import { useConverter } from './composables/useConverter';
import type { Currency } from './types/currency';

const {
  sourceCurrency,
  sourceAmount,
  targetCurrencies,
  conversions,
  currencies,
  isLoading,
  error,
  lastUpdated,
  popularCurrencies,
  cryptoCurrencies,
  fiatCurrencies,
  canAddMoreTargets: canAddMore,
  addTarget,
  removeTarget,
  swapCurrency,
  updateAmount,
  updateSourceCurrency,
  fetchCurrencies,
  refreshRates,
} = useConverter();

const showAddCurrency = ref(false);
const initialLoading = ref(true);
const autoRefreshInterval = ref<number | null>(null);

// Computed properties
const disabledCurrencyIds = computed(() => {
  const ids = targetCurrencies.value.map(t => t.currency.id);
  if (sourceCurrency.value) {
    ids.push(sourceCurrency.value.id);
  }
  return ids;
});

// Methods
const handleUpdateSourceCurrency = (currency: Currency) => {
  updateSourceCurrency(currency.id);
};

const handleAddCurrency = (currency: Currency) => {
  const success = addTarget(currency);
  if (!success) {
    console.warn('Could not add currency');
  }
};

const handleRefresh = async () => {
  await refreshRates();
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleTimeString();
};

// Auto-refresh setup
const setupAutoRefresh = () => {
  // Refresh rates every 60 seconds
  autoRefreshInterval.value = window.setInterval(() => {
    refreshRates();
  }, 60000);
};

const cleanupAutoRefresh = () => {
  if (autoRefreshInterval.value) {
    clearInterval(autoRefreshInterval.value);
    autoRefreshInterval.value = null;
  }
};

// Lifecycle
onMounted(async () => {
  await fetchCurrencies();
  initialLoading.value = false;
  setupAutoRefresh();
});

onUnmounted(() => {
  cleanupAutoRefresh();
});
</script>
