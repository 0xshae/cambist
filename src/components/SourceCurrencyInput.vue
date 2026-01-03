<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <label class="block text-sm font-medium text-gray-700 mb-2">Source Currency</label>
    
    <div class="space-y-4">
      <!-- Currency selector button -->
      <button
        @click="showSelector = true"
        class="w-full flex items-center justify-between px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div v-if="selectedCurrency" class="flex items-center space-x-3">
          <span class="text-2xl">{{ getCurrencyIcon(selectedCurrency) }}</span>
          <div class="text-left">
            <div class="font-semibold text-gray-900">{{ selectedCurrency.symbol.toUpperCase() }}</div>
            <div class="text-sm text-gray-500">{{ selectedCurrency.name }}</div>
          </div>
        </div>
        <div v-else class="text-gray-500">Select currency</div>
        <ChevronDown :size="20" class="text-gray-400" />
      </button>

      <!-- Amount input -->
      <div class="relative">
        <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
        <div class="relative">
          <input
            :value="modelValue"
            @input="handleInput"
            type="number"
            step="any"
            min="0"
            placeholder="Enter amount"
            class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <div v-if="selectedCurrency" class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
            {{ selectedCurrency.symbol.toUpperCase() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Currency selector modal -->
    <CurrencySelector
      :is-open="showSelector"
      :currencies="currencies"
      :popular-currencies="popularCurrencies"
      :crypto-currencies="cryptoCurrencies"
      :fiat-currencies="fiatCurrencies"
      :disabled-currencies="disabledCurrencies"
      @close="showSelector = false"
      @select="handleSelectCurrency"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import CurrencySelector from './CurrencySelector.vue';
import type { Currency } from '../types/currency';

interface Props {
  modelValue: number;
  selectedCurrency: Currency | null;
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
  'update:modelValue': [value: number];
  'update:selectedCurrency': [currency: Currency];
}>();

const showSelector = ref(false);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = parseFloat(target.value) || 0;
  emit('update:modelValue', value);
};

const handleSelectCurrency = (currency: Currency) => {
  emit('update:selectedCurrency', currency);
};

const getCurrencyIcon = (currency: Currency) => {
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
</script>

