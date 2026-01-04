<template>
  <div class="space-y-4">
    <!-- Target currency items -->
    <TransitionGroup name="list" tag="div" class="space-y-4">
      <TargetCurrencyItem
        v-for="target in targetCurrencies"
        :key="target.id"
        :target="target"
        :conversion="getConversion(target.currency.id)"
        :is-loading="isLoading"
        @remove="emit('remove', target.id)"
        @swap="emit('swap', target.id)"
      />
    </TransitionGroup>

    <!-- Empty state -->
    <div v-if="targetCurrencies.length === 0" class="text-center py-20 bg-white/60 backdrop-blur-sm border-2 border-dashed border-gray-300 rounded-3xl hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300">
      <div class="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
        <TrendingUp :size="32" class="text-gray-400" />
      </div>
      <p class="text-gray-900 font-semibold text-lg mb-2">No target currencies yet</p>
      <p class="text-sm text-gray-500 mb-6 max-w-xs mx-auto">Add currencies below to see real-time conversions</p>
    </div>

    <!-- Add button -->
    <button
      @click="emit('add')"
      :disabled="!canAddMore"
      class="w-full flex items-center justify-center space-x-3 px-6 py-5 bg-white border-2 border-dashed border-gray-300 rounded-3xl hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-white group shadow-sm hover:shadow-lg"
    >
      <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-blue-500/30">
        <Plus :size="20" class="text-white" />
      </div>
      <div class="text-left">
        <div class="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
          {{ targetCurrencies.length === 0 ? 'Add your first currency' : 'Add another currency' }}
        </div>
        <div class="text-xs text-gray-500">
          {{ canAddMore ? `${10 - targetCurrencies.length} slots remaining` : 'Maximum reached' }}
        </div>
      </div>
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

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
