import { ref, watch } from 'vue';
import { debounce } from '../utils/formatters';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  // Try to load from localStorage
  const loadFromStorage = (): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultValue;
    }
  };

  const data = ref<T>(loadFromStorage());

  // Save to localStorage with debouncing
  const saveToStorage = debounce((value: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, 500);

  // Watch for changes and save
  watch(data, (newValue) => {
    saveToStorage(newValue);
  }, { deep: true });

  return data;
}

