<template>
  <div class="border border-gray-200 rounded-2xl bg-white hover:border-gray-300 transition-all">
    <div class="p-6">
      <!-- Amount input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-500 mb-3">Amount</label>
        <input
          :value="modelValue"
          @input="handleInput"
          type="number"
          step="any"
          min="0"
          placeholder="0.00"
          class="w-full text-4xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder-gray-300"
        />
      </div>

      <!-- Currency selector -->
      <button
        @click="showSelector = true"
        class="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
      >
        <div v-if="selectedCurrency" class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <span class="text-2xl">{{ getCurrencyIcon(selectedCurrency) }}</span>
          </div>
          <div class="text-left">
            <div class="font-semibold text-gray-900 text-lg">{{ selectedCurrency.symbol.toUpperCase() }}</div>
            <div class="text-sm text-gray-500">{{ selectedCurrency.name }}</div>
          </div>
        </div>
        <div v-else class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
            <span class="text-2xl">💰</span>
          </div>
          <div class="text-left">
            <div class="font-medium text-gray-500">Select currency</div>
          </div>
        </div>
        <ChevronDown :size="20" class="text-gray-400 group-hover:text-gray-600 transition-colors" />
      </button>
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
