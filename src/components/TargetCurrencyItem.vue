<template>
  <div class="bg-white rounded-3xl shadow-xl shadow-gray-900/5 border border-gray-200/60 overflow-hidden hover:shadow-2xl hover:shadow-gray-900/10 transition-all duration-300 group">
    <div class="p-6">
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center space-x-4 flex-1">
          <div class="relative">
            <div class="w-14 h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <span class="text-3xl">{{ getCurrencyIcon(target.currency) }}</span>
            </div>
            <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <span class="text-white text-xs font-bold">→</span>
            </div>
          </div>
          <div>
            <div class="font-bold text-gray-900 text-lg">{{ target.currency.symbol.toUpperCase() }}</div>
            <div class="text-sm text-gray-500">{{ target.currency.name }}</div>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            @click="emit('swap')"
            class="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
            title="Swap with source"
          >
            <ArrowLeftRight :size="18" />
          </button>
          <button
            @click="emit('remove')"
            class="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Remove"
          >
            <X :size="18" />
          </button>
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-5"></div>

      <!-- Amount display -->
      <div class="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl px-5 py-4 border border-gray-200/60">
        <div v-if="isLoading" class="animate-pulse">
          <div class="h-9 w-40 bg-gray-200 rounded-lg"></div>
        </div>
        <div v-else-if="conversion">
          <div class="text-3xl font-bold text-gray-900 mb-1">
            {{ formatAmount(conversion.amount) }}
          </div>
          <div class="text-xs text-gray-500 font-medium">Converted amount</div>
        </div>
        <div v-else>
          <div class="text-3xl font-bold text-gray-400">-</div>
          <div class="text-xs text-gray-500 font-medium">Calculating...</div>
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
