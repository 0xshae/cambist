<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4" @click="closeModal">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col" @click.stop>
      <!-- Header -->
      <div class="px-8 py-6 border-b border-gray-200">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-900">Select Currency</h2>
          <button
            @click="closeModal"
            class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors"
            aria-label="Close"
          >
            <X :size="20" />
          </button>
        </div>
        
        <!-- Search input -->
        <div class="relative">
          <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" :size="20" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search currencies..."
            class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-colors"
          />
        </div>
      </div>

      <!-- Currency list -->
      <div class="overflow-y-auto flex-1 px-8 py-6">
        <!-- Popular currencies -->
        <div v-if="filteredPopular.length > 0 && !searchQuery" class="mb-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Popular</h3>
          <div class="space-y-1">
            <button
              v-for="currency in filteredPopular"
              :key="currency.id"
              @click="selectCurrency(currency)"
              :disabled="isDisabled(currency)"
              class="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left group"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-white">
                  <span class="text-xl">{{ getCurrencyIcon(currency) }}</span>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">{{ currency.symbol.toUpperCase() }}</div>
                  <div class="text-sm text-gray-500">{{ currency.name }}</div>
                </div>
              </div>
              <span class="text-xs px-2.5 py-1 rounded-full font-medium" :class="currency.type === 'crypto' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
                {{ currency.type }}
              </span>
            </button>
          </div>
        </div>

        <!-- Crypto currencies -->
        <div v-if="filteredCrypto.length > 0" class="mb-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Crypto</h3>
          <div class="space-y-1">
            <button
              v-for="currency in filteredCrypto"
              :key="currency.id"
              @click="selectCurrency(currency)"
              :disabled="isDisabled(currency)"
              class="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left group"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-white">
                  <span class="text-xl">{{ getCurrencyIcon(currency) }}</span>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">{{ currency.symbol.toUpperCase() }}</div>
                  <div class="text-sm text-gray-500">{{ currency.name }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Fiat currencies -->
        <div v-if="filteredFiat.length > 0" class="mb-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Fiat</h3>
          <div class="space-y-1">
            <button
              v-for="currency in filteredFiat"
              :key="currency.id"
              @click="selectCurrency(currency)"
              :disabled="isDisabled(currency)"
              class="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-left group"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-white">
                  <span class="text-xl">{{ getCurrencyIcon(currency) }}</span>
                </div>
                <div>
                  <div class="font-semibold text-gray-900">{{ currency.symbol.toUpperCase() }}</div>
                  <div class="text-sm text-gray-500">{{ currency.name }}</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- No results -->
        <div v-if="noResults" class="text-center py-12">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search :size="28" class="text-gray-400" />
          </div>
          <p class="text-gray-500 font-medium">No currencies found</p>
          <p class="text-sm text-gray-400 mt-1">Try a different search term</p>
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
