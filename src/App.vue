<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header class="border-b border-gray-200 bg-white">
      <div class="max-w-[1400px] mx-auto px-8 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <DollarSign :size="24" class="text-white" />
            </div>
            <h1 class="text-2xl font-semibold text-gray-900">Currency Converter</h1>
          </div>
          <div class="flex items-center space-x-6">
            <div v-if="lastUpdated" class="text-sm text-gray-500">
              Last updated {{ formatTime(lastUpdated) }}
            </div>
            <button
              @click="handleRefresh"
              :disabled="isLoading"
              class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh rates"
            >
              <RefreshCw :size="18" :class="{ 'animate-spin': isLoading }" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <main class="max-w-[1400px] mx-auto px-8 py-12">
      <!-- Loading state -->
      <div v-if="initialLoading" class="text-center py-24">
        <RefreshCw :size="48" class="animate-spin mx-auto text-blue-600 mb-4" />
        <p class="text-gray-600">Loading currencies...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-2xl p-6 max-w-2xl mx-auto">
        <div class="flex items-start space-x-3">
          <AlertCircle :size="24" class="text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 class="font-semibold text-red-900 mb-1">Error loading data</h3>
            <p class="text-red-700 text-sm">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Converter interface -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Left: Source currency -->
        <div class="space-y-6">
          <div>
            <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">You Send</h2>
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
          </div>

          <!-- Info cards -->
          <div class="space-y-4 pt-8">
            <div class="bg-blue-50 rounded-2xl p-6">
              <div class="flex items-start space-x-3">
                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap :size="20" class="text-white" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-1">Real-time Rates</h3>
                  <p class="text-sm text-gray-600">Exchange rates are updated every 60 seconds automatically using CoinGecko API.</p>
                </div>
              </div>
            </div>
            
            <div class="bg-purple-50 rounded-2xl p-6">
              <div class="flex items-start space-x-3">
                <div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp :size="20" class="text-white" />
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 mb-1">Multi-Currency</h3>
                  <p class="text-sm text-gray-600">Convert to up to 10 different currencies at once. Mix crypto and fiat freely.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Target currencies -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wider">You Receive</h2>
            <span class="text-sm text-gray-500">{{ targetCurrencies.length }} / 10</span>
          </div>
          
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
import { DollarSign, RefreshCw, AlertCircle, Zap, TrendingUp } from 'lucide-vue-next';
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
