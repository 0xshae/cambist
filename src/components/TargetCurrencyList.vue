<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-lg font-semibold text-gray-900">Target Currencies</h2>
      <span class="text-sm text-gray-500">{{ targetCurrencies.length }} / {{ maxTargets }}</span>
    </div>

    <!-- Target currency items -->
    <div class="space-y-3 mb-4">
      <TargetCurrencyItem
        v-for="target in targetCurrencies"
        :key="target.id"
        :target="target"
        :conversion="getConversion(target.currency.id)"
        :is-loading="isLoading"
        @remove="emit('remove', target.id)"
        @swap="emit('swap', target.id)"
      />

      <!-- Empty state -->
      <div v-if="targetCurrencies.length === 0" class="text-center py-8 text-gray-500">
        <p class="mb-2">No target currencies added</p>
        <p class="text-sm">Click the + button below to add currencies</p>
      </div>
    </div>

    <!-- Add button -->
    <button
      @click="emit('add')"
      :disabled="!canAddMore"
      class="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent"
    >
      <Plus :size="20" />
      <span class="font-medium">Add Currency</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { Plus } from 'lucide-vue-next';
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

