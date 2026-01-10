<template>
  <div class="min-h-screen bg-gradient-to-br from-[#cae2f2]/20 via-white to-[#008cff]/5 relative">
    <!-- Noise texture overlay -->
    <div class="fixed inset-0 opacity-[0.015] pointer-events-none" style="background-image: url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E'); background-repeat: repeat;"></div>
    <!-- Header -->
    <header class="bg-white/70 backdrop-blur-md border-b border-gray-200/40 sticky top-0 z-40 relative">
      <div class="max-w-[1600px] mx-auto px-8 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <img src="/cambio_final.png" alt="Cambio" class="h-10 w-auto" />
          </div>
          <div class="flex items-center space-x-6">
            <div v-if="lastUpdated" class="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Updated {{ formatTime(lastUpdated) }}</span>
            </div>
            <button
              @click="handleRefresh"
              :disabled="isLoading"
              class="flex items-center space-x-2 px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-[#008cff] bg-white border border-gray-200 rounded-xl hover:border-[#008cff] hover:shadow-md hover:shadow-[#008cff]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div class="w-20 h-20 bg-gradient-to-br from-[#008cff] to-[#008cff]/80 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-[#008cff]/40">
          <RefreshCw :size="32" class="animate-spin text-white" />
        </div>
        <p class="text-lg font-medium text-gray-900 mb-2">Loading currencies...</p>
        <p class="text-sm text-gray-500">Fetching real-time exchange rates</p>
      </div>

      <!-- Error state / Warning -->
      <div v-else-if="error" class="bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl p-5 max-w-2xl mx-auto mb-8">
        <div class="flex items-start space-x-3">
          <div class="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <AlertCircle :size="18" class="text-amber-600" />
          </div>
          <div>
            <h3 class="font-semibold text-amber-900 mb-1 text-sm">Notice</h3>
            <p class="text-amber-700 text-xs">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Hero text -->
      <div v-if="!initialLoading" class="text-center mb-12 relative">
        <h2 class="text-4xl md:text-5xl mb-3">
          <span class="bg-gradient-to-r from-[#008cff] to-[#008cff]/70 bg-clip-text text-transparent">Multi-Currency Converter</span>
        </h2>
        <p class="text-lg md:text-xl text-gray-600 font-medium">
          Compare against multiple assets at once.
        </p>
      </div>

      <!-- Converter interface -->
      <div v-if="!initialLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <!-- Left: Source currency -->
        <div>
          <div class="mb-4">
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider">From</h2>
          </div>
          
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
          <div class="mb-4">
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider">To</h2>
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

// Auto-refresh setup - disabled to prevent disruption during calculations
// Users can manually refresh using the refresh button if needed
const setupAutoRefresh = () => {
  // Auto-refresh disabled - use manual refresh button instead
  // Uncomment below to enable auto-refresh every 5 minutes:
  // autoRefreshInterval.value = window.setInterval(() => {
  //   refreshRates();
  // }, 300000);
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
