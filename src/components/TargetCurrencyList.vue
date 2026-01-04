<template>
  <div class="space-y-3">
    <!-- Target currency items -->
    <div class="space-y-3">
      <TargetCurrencyItem
        v-for="target in targetCurrencies"
        :key="target.id"
        :target="target"
        :conversion="getConversion(target.currency.id)"
        :is-loading="isLoading"
        @remove="emit('remove', target.id)"
        @swap="emit('swap', target.id)"
      />
    </div>

    <!-- Empty state -->
    <div v-if="targetCurrencies.length === 0" class="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <TrendingUp :size="28" class="text-gray-400" />
      </div>
      <p class="text-gray-500 font-medium mb-1">No target currencies</p>
      <p class="text-sm text-gray-400 mb-4">Add currencies to see conversions</p>
    </div>

    <!-- Add button -->
    <button
      @click="emit('add')"
      :disabled="!canAddMore"
      class="w-full flex items-center justify-center space-x-2 px-6 py-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent group"
    >
      <Plus :size="20" class="text-gray-400 group-hover:text-blue-600 transition-colors" />
      <span class="font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
        {{ targetCurrencies.length === 0 ? 'Add your first currency' : 'Add another currency' }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Plus, TrendingUp } from 'lucide-vue-next';
import TargetCurrencyItem from './TargetCurrencyItem.vue';
import type { TargetCurrency, ConversionResult } from '../types/currency';

interface Props {
  targetCurrencies: TargetCurrency[];
  conversions: ConversionResult[];
  canAddMore: boolean;
  maxTargets: number;
  isLoading: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  add: [];
  remove: [id: string];
  swap: [id: string];
}>();

const getConversion = (currencyId: string): ConversionResult | undefined => {
  return props.conversions.find(c => c.currency.id === currencyId);
};
</script>
