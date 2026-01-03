<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="closeModal">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-gray-900">Select Currency</h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X :size="24" />
          </button>
        </div>
        
        <!-- Search input -->
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" :size="20" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search currencies..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Currency list -->
      <div class="overflow-y-auto flex-1 px-6 py-4">
        <!-- Popular currencies -->
        <div v-if="filteredPopular.length > 0 && !searchQuery" class="mb-6">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Popular</h3>
          <div class="space-y-1">
            <button
              v-for="currency in filteredPopular"
              :key="currency.id"
              @click="selectCurrency(currency)"
              :disabled="isDisabled(currency)"
              class="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div class="flex items-center space-x-3">
                <span class="text-2xl">{{ getCurrencyIcon(currency) }}</span>
                <div>
                  <div class="font-medium text-gray-900">{{ currency.symbol.toUpperCase() }}</div>
                  <div class="text-sm text-gray-500">{{ currency.name }}</div>
                </div>
              </div>
              <span class="text-xs px-2 py-1 rounded" :class="currency.type === 'crypto' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                {{ currency.type }}
              </span>
            </button>
          </div>
        </div>

        <!-- Crypto currencies -->
        <div v-if="filteredCrypto.length > 0" class="mb-6">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Crypto</h3>
          <div class="space-y-1">
            <button
              v-for="currency in filteredCrypto"
              :key="currency.id"
              @click="selectCurrency(currency)"
              :disabled="isDisabled(currency)"
              class="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div class="flex items-center space-x-3">
                <span class="text-2xl">{{ getCurrencyIcon(currency) }}</span>
                <div>
                  <div class="font-medium text-gray-900">{{ currency.symbol.toUpperCase() }}</div>
                  <div class="text-sm text-gray-500">{{ currency.name }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Fiat currencies -->
        <div v-if="filteredFiat.length > 0" class="mb-6">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Fiat</h3>
          <div class="space-y-1">
            <button
              v-for="currency in filteredFiat"
              :key="currency.id"
              @click="selectCurrency(currency)"
              :disabled="isDisabled(currency)"
              class="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <div class="flex items-center space-x-3">
                <span class="text-2xl">{{ getCurrencyIcon(currency) }}</span>
                <div>
                  <div class="font-medium text-gray-900">{{ currency.symbol.toUpperCase() }}</div>
                  <div class="text-sm text-gray-500">{{ currency.name }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- No results -->
        <div v-if="noResults" class="text-center py-8 text-gray-500">
          No currencies found
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Search } from 'lucide-vue-next';
import type { Currency } from '../types/currency';

interface Props {
  isOpen: boolean;
  currencies: Currency[];
  popularCurrencies: Currency[];
  cryptoCurrencies: Currency[];
  fiatCurrencies: Currency[];
  disabledCurrencies?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  disabledCurrencies: () => [],
});

const emit = defineEmits<{
  close: [];
  select: [currency: Currency];
}>();

const searchQuery = ref('');

const filterCurrencies = (currencies: Currency[]) => {
  if (!searchQuery.value) {
    return currencies.slice(0, 20); // Limit to first 20 if no search
  }

  const query = searchQuery.value.toLowerCase();
  return currencies.filter(c => 
    c.id.toLowerCase().includes(query) ||
    c.symbol.toLowerCase().includes(query) ||
    c.name.toLowerCase().includes(query)
  ).slice(0, 50); // Limit to 50 results
};

const filteredPopular = computed(() => filterCurrencies(props.popularCurrencies));
const filteredCrypto = computed(() => filterCurrencies(props.cryptoCurrencies));
const filteredFiat = computed(() => filterCurrencies(props.fiatCurrencies));

const noResults = computed(() => {
  return searchQuery.value && 
         filteredPopular.value.length === 0 && 
         filteredCrypto.value.length === 0 && 
         filteredFiat.value.length === 0;
});

const isDisabled = (currency: Currency) => {
  return props.disabledCurrencies.includes(currency.id);
};

const getCurrencyIcon = (currency: Currency) => {
  // Simple icon mapping - you could expand this
  const icons: Record<string, string> = {
    usd: '💵',
    eur: '💶',
    gbp: '💷',
    jpy: '💴',
    btc: '₿',
    eth: 'Ξ',
    bitcoin: '₿',
    ethereum: 'Ξ',
  };

  return icons[currency.id] || icons[currency.symbol] || (currency.type === 'crypto' ? '🪙' : '💰');
};

const selectCurrency = (currency: Currency) => {
  if (!isDisabled(currency)) {
    emit('select', currency);
    closeModal();
  }
};

const closeModal = () => {
  searchQuery.value = '';
  emit('close');
};
</script>

