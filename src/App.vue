<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <!-- Header -->
    <header class="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40">
      <div class="max-w-[1600px] mx-auto px-8 py-5">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <DollarSign :size="24" class="text-white" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Currency Converter</h1>
              <p class="text-xs text-gray-500">Real-time exchange rates</p>
            </div>
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

      <!-- Converter interface -->
      <div v-if="!initialLoading" class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <!-- Left: Source currency -->
        <div class="space-y-6">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider">From</h2>
            <span class="text-xs text-gray-500 font-medium">Source Currency</span>
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

          <!-- Feature highlights -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div class="bg-white/60 backdrop-blur-sm border border-blue-200/60 rounded-2xl p-5 hover:shadow-lg hover:shadow-blue-500/10 transition-all">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-3 shadow-md shadow-blue-500/30">
                <Zap :size="20" class="text-white" />
              </div>
              <h3 class="font-semibold text-gray-900 mb-1.5">Live Rates</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Real-time exchange rates updated every minute</p>
            </div>
            
            <div class="bg-white/60 backdrop-blur-sm border border-purple-200/60 rounded-2xl p-5 hover:shadow-lg hover:shadow-purple-500/10 transition-all">
              <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 shadow-md shadow-purple-500/30">
                <TrendingUp :size="20" class="text-white" />
              </div>
              <h3 class="font-semibold text-gray-900 mb-1.5">Multi-Convert</h3>
              <p class="text-sm text-gray-600 leading-relaxed">Convert to up to 10 currencies simultaneously</p>
            </div>
          </div>
        </div>

        <!-- Right: Target currencies -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-sm font-bold text-gray-900 uppercase tracking-wider">To</h2>
            <div class="flex items-center space-x-3">
              <span class="text-xs text-gray-500 font-medium">Target Currencies</span>
              <span class="px-2.5 py-1 bg-gray-900 text-white text-xs font-bold rounded-lg">
                {{ targetCurrencies.length }}/10
              </span>
            </div>
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
