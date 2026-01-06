<template>
  <div class="bg-white rounded-3xl shadow-xl shadow-gray-900/5 border border-gray-200/60 overflow-hidden hover:shadow-2xl hover:shadow-gray-900/10 transition-all duration-300">
    <div class="p-8">
      <!-- Currency selector and amount on same line -->
      <div class="flex items-center justify-between gap-6 mb-6">
        <!-- Currency button -->
        <button
          @click="showSelector = true"
          class="flex items-center gap-3 px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100/50 hover:from-blue-50 hover:to-indigo-50 border border-gray-200 hover:border-blue-300 rounded-2xl transition-all duration-300 group shadow-sm hover:shadow-md min-w-[200px]"
        >
          <div v-if="selectedCurrency" class="flex items-center gap-3">
            <div class="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span class="text-2xl">{{ getCurrencyIcon(selectedCurrency) }}</span>
            </div>
            <div class="text-left">
              <div class="font-bold text-gray-900 text-lg leading-tight">{{ selectedCurrency.symbol.toUpperCase() }}</div>
              <div class="text-xs text-gray-500 leading-tight">{{ selectedCurrency.name }}</div>
            </div>
          </div>
          <div v-else class="flex items-center gap-3">
            <div class="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <span class="text-2xl">💰</span>
            </div>
            <div class="text-left">
              <div class="font-semibold text-gray-500 text-base">Select currency</div>
            </div>
          </div>
          <div class="ml-auto">
            <ChevronDown :size="18" class="text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
        </button>

        <!-- Amount input -->
        <div class="flex-1 text-right">
          <input
            :value="modelValue"
            @input="handleInput"
            type="number"
            step="any"
            min="0"
            placeholder="0.00"
            class="w-full text-right text-4xl font-bold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder-gray-300"
          />
        </div>
      </div>

      <!-- Label row -->
      <div class="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
        <span>Currency</span>
        <span>Amount</span>
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
