<script setup lang="ts">
import { computed, ref } from "vue";

interface Item {
  value: number;
  label: string;
}

interface Props {
  modelValue: number[];
  items: Item[];
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Select items...",
});

const emit = defineEmits<{
  (e: "update:modelValue", value: number[]): void;
}>();

const searchTerm = ref("");
const isOpen = ref(false);

const filteredItems = computed(() =>
  props.items.filter(
    (item) =>
      item.label.toLowerCase().includes(searchTerm.value.toLowerCase()) &&
      !props.modelValue.includes(item.value)
  )
);

const selectedItems = computed(() =>
  props.modelValue.map((id) => props.items.find((item) => item.value === id)).filter((item): item is Item => item !== undefined)
);

const handleSelect = (itemValue: number) => {
  const newModelValue = [...props.modelValue, itemValue];
  emit("update:modelValue", newModelValue);
  searchTerm.value = "";
};

const handleRemove = (itemValue: number) => {
  const newModelValue = props.modelValue.filter((id) => id !== itemValue);
  emit("update:modelValue", newModelValue);
};

const handleFocus = () => {
  isOpen.value = true;
};

const handleBlur = () => {
  // Delay to allow click events on dropdown items
  setTimeout(() => {
    isOpen.value = false;
  }, 200);
};
</script>

<template>
  <div class="w-full">
    <div class="flex flex-wrap gap-2 mb-2" v-if="selectedItems.length > 0">
      <span
        v-for="item in selectedItems"
        :key="item.value"
        class="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary dark:bg-primary/20"
      >
        {{ item.label }}
        <button
          type="button"
          @click="handleRemove(item.value)"
          class="ml-1 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </span>
    </div>

    <div class="relative">
      <input
        v-model="searchTerm"
        type="text"
        :placeholder="placeholder"
        @focus="handleFocus"
        @blur="handleBlur"
        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-neutral-800 dark:border-neutral-700"
      />

      <div
        v-if="isOpen && filteredItems.length > 0"
        class="absolute z-50 w-full mt-1 max-h-60 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md dark:bg-neutral-800 dark:border-neutral-700"
      >
        <div class="p-1">
          <div
            v-for="item in filteredItems"
            :key="item.value"
            @click="handleSelect(item.value)"
            class="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground dark:hover:bg-neutral-700"
          >
            {{ item.label }}
          </div>
        </div>
      </div>

      <div
        v-else-if="isOpen && filteredItems.length === 0 && searchTerm"
        class="absolute z-50 w-full mt-1 rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground dark:bg-neutral-800 dark:border-neutral-700"
      >
        No items found.
      </div>

      <div
        v-else-if="isOpen && filteredItems.length === 0 && !searchTerm"
        class="absolute z-50 w-full mt-1 rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground dark:bg-neutral-800 dark:border-neutral-700"
      >
        All items selected.
      </div>
    </div>
  </div>
</template>
