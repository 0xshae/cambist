<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40">
      <div class="max-w-[1600px] mx-auto px-8 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <img src="/cambist_no_bg_rec.png" alt="Cambio" class="h-10 w-auto" />
          </div>
          <div class="flex items-center space-x-6">
            <div v-if="lastUpdated" class="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Updated {{ formatTime(lastUpdated) }}</span>
            </div>
            <button
              @click="handleRefresh"
              :disabled="isLoading"
              class="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
    <main class="max-w-[1600px] mx-auto px-8 py-12">
      <!-- Loading state -->
      <div v-if="initialLoading" class="text-center py-32">
        <div class="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/30">
          <RefreshCw :size="32" class="animate-spin text-white" />
        </div>
        <p class="text-lg font-medium text-gray-900 mb-2">Loading currencies...</p>
        <p class="text-sm text-gray-500">Fetching real-time exchange rates</p>
      </div>

      <!-- Error state / Warning -->
      <div v-else-if="error" class="bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-2xl mx-auto mb-8">
        <div class="flex items-start space-x-3">
          <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle :size="20" class="text-amber-600" />
          </div>
          <div>
            <h3 class="font-semibold text-amber-900 mb-1">Limited functionality</h3>
            <p class="text-amber-700 text-sm">{{ error }}</p>
            <p class="text-amber-600 text-xs mt-2">You can still use the app with available currencies.</p>
          </div>
        </div>
      </div>

      <!-- Hero text -->
      <div v-if="!initialLoading" class="text-center mb-12">
        <h2 class="text-4xl md:text-5xl text-gray-900 mb-3">
          Multi-Currency Converter
        </h2>
        <p class="text-lg md:text-xl text-gray-600 font-medium">
          Compare against multiple assets at once.
        </p>
      </div>

      <!-- Converter interface -->
      <div v-if="!initialLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Left: Source currency -->
        <div class="space-y-6">
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

        <!-- Right: Target currencies -->
        <div>
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
import { RefreshCw, AlertCircle } from 'lucide-vue-next';
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
