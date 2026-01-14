<template>
  <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg shadow-gray-900/5 border border-gray-200/60 hover:shadow-xl hover:shadow-[#008cff]/10 hover:border-[#008cff]/30 transition-all duration-300 relative">
    <div class="p-6">
      <!-- Amount and Currency selector - horizontal layout -->
      <div class="flex items-center gap-6">
        <!-- Amount input -->
        <div class="flex-1 min-w-0">
          <input
            :value="displayValue"
            @input="handleInput"
            type="number"
            step="0.01"
            min="0"
            placeholder="Enter amount..."
            :disabled="!selectedCurrency"
            class="w-full text-3xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <!-- Currency selector -->
        <div class="flex-shrink-0">
          <button
            @click="showSelector = true"
            class="flex items-center justify-between p-3 bg-gradient-to-br from-[#cae2f2]/20 to-[#cae2f2]/10 hover:from-[#008cff]/10 hover:to-[#cae2f2]/30 border border-gray-200 hover:border-[#008cff] rounded-xl transition-all duration-300 group shadow-sm hover:shadow-md hover:shadow-[#008cff]/20 min-w-[180px]"
          >
            <div v-if="selectedCurrency" class="flex items-center space-x-2.5">
              <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                <span class="text-lg">{{ getCurrencyIcon(selectedCurrency) }}</span>
              </div>
              <div class="text-left">
                <div class="font-semibold text-gray-900 text-base">{{ selectedCurrency.symbol.toUpperCase() }}</div>
                <div class="text-xs text-gray-600">{{ selectedCurrency.name }}</div>
              </div>
            </div>
            <div v-else class="flex items-center space-x-2.5">
              <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span class="text-lg">💱</span>
              </div>
              <div class="text-left">
                <div class="font-semibold text-gray-500 text-sm">Select currency</div>
                <div class="text-xs text-gray-400">Choose to start</div>
              </div>
            </div>
            <div class="flex items-center justify-center w-7 h-7 bg-white/80 rounded-lg group-hover:bg-gradient-to-br group-hover:from-[#008cff] group-hover:to-[#008cff]/80 transition-all ml-2">
              <ChevronDown :size="16" class="text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Currency selector modal - outside of the card to avoid clipping -->
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
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

// Computed value that always shows rounded to 2 decimals
const displayValue = computed(() => {
  return Math.round(props.modelValue * 100) / 100;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let value = parseFloat(target.value) || 0;
  // Round to 2 decimal places
  value = Math.round(value * 100) / 100;
  emit('update:modelValue', value);
};

const handleSelectCurrency = (currency: Currency) => {
  emit('update:selectedCurrency', currency);
};

const getCurrencyIcon = (currency: Currency) => {
  return currency.type === 'crypto' ? '🪙' : '💵';
};
</script>

