<template>
  <div class="border border-gray-200 rounded-2xl bg-white hover:border-gray-300 hover:shadow-sm transition-all group">
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex items-center space-x-3 flex-1">
          <div class="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
            <span class="text-2xl">{{ getCurrencyIcon(target.currency) }}</span>
          </div>
          <div>
            <div class="font-semibold text-gray-900">{{ target.currency.symbol.toUpperCase() }}</div>
            <div class="text-sm text-gray-500">{{ target.currency.name }}</div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            @click="emit('swap')"
            class="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Swap with source"
          >
            <ArrowLeftRight :size="16" />
          </button>
          <button
            @click="emit('remove')"
            class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Remove"
          >
            <X :size="16" />
          </button>
        </div>
      </div>

      <!-- Amount display -->
      <div class="bg-gray-50 rounded-xl px-4 py-3">
        <div v-if="isLoading" class="animate-pulse">
          <div class="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
        <div v-else-if="conversion" class="text-2xl font-semibold text-gray-900">
          {{ formatAmount(conversion.amount) }}
        </div>
        <div v-else class="text-2xl font-semibold text-gray-400">
          -
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftRight, X } from 'lucide-vue-next';
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
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } else if (amount >= 1) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
  } else if (amount > 0) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    }).format(amount);
  }
  return '0.00';
};
</script>
