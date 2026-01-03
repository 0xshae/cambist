<template>
  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
    <div class="flex items-center space-x-3 flex-1">
      <span class="text-2xl">{{ getCurrencyIcon(target.currency) }}</span>
      <div class="flex-1">
        <div class="font-semibold text-gray-900">{{ target.currency.symbol.toUpperCase() }}</div>
        <div class="text-sm text-gray-500">{{ target.currency.name }}</div>
      </div>
      <div class="text-right">
        <div v-if="isLoading" class="animate-pulse">
          <div class="h-6 w-24 bg-gray-200 rounded"></div>
        </div>
        <div v-else-if="conversion" class="font-bold text-lg text-gray-900">
          {{ formatAmount(conversion.amount) }}
        </div>
        <div v-else class="text-gray-400">-</div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex items-center space-x-2 ml-4">
      <button
        @click="emit('swap')"
        class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="Swap with source"
      >
        <ArrowLeftRight :size="18" />
      </button>
      <button
        @click="emit('remove')"
        class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Remove"
      >
        <Trash2 :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftRight, Trash2 } from 'lucide-vue-next';
import type { TargetCurrency, ConversionResult, Currency } from '../types/currency';

interface Props {
  target: TargetCurrency;
  conversion?: ConversionResult;
  isLoading: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  remove: [];
  swap: [];
}>();

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

const formatAmount = (amount: number) => {
  if (amount >= 1000000) {
    return amount.toFixed(2);
  } else if (amount >= 1) {
    return amount.toFixed(4);
  } else {
    return amount.toFixed(8);
  }
};
</script>

