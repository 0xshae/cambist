<template>
  <div class="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg shadow-gray-900/5 border border-gray-200/60 overflow-hidden hover:shadow-xl hover:shadow-[#008cff]/10 hover:border-[#008cff]/30 transition-all duration-300 group relative">
    <div class="p-5">
      <div class="flex items-center justify-between gap-6">
        <!-- Amount display -->
        <div class="flex-1 min-w-0">
          <div v-if="isLoading" class="animate-pulse">
            <div class="h-8 w-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div v-else-if="conversion" class="text-3xl font-semibold text-gray-900">
            {{ formatAmount(conversion.amount) }}
          </div>
          <div v-else class="text-3xl font-semibold text-gray-400">-</div>
        </div>

        <!-- Currency info and actions -->
        <div class="flex items-center gap-3">
          <div class="flex items-center space-x-2.5 p-3 bg-gradient-to-br from-[#cae2f2]/20 to-[#cae2f2]/10 rounded-xl border border-gray-200/60 min-w-[180px]">
            <div class="relative">
              <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span class="text-lg">{{ getCurrencyIcon(target.currency) }}</span>
              </div>
              <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-[#008cff] to-[#008cff]/80 rounded flex items-center justify-center shadow-md shadow-[#008cff]/40">
                <span class="text-white text-[10px] font-bold">→</span>
              </div>
            </div>
            <div>
              <div class="font-semibold text-gray-900 text-base">{{ target.currency.symbol.toUpperCase() }}</div>
              <div class="text-xs text-gray-600">{{ target.currency.name }}</div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <button
              @click="emit('swap')"
              class="p-2 text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-[#008cff] hover:to-[#008cff]/80 rounded-lg transition-all"
              title="Swap with source"
            >
              <ArrowLeftRight :size="16" />
            </button>
            <button
              @click="emit('remove')"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-900 rounded-lg transition-all"
              title="Remove"
            >
              <X :size="16" />
            </button>
          </div>
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
  return currency.type === 'crypto' ? '🪙' : '💵';
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
