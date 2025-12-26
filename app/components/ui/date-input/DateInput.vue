<template>
  <Popover v-model:open="showCalendar">
    <div class="relative">
      <input
        :id="id"
        ref="inputRef"
        v-model="displayValue"
        type="text"
        :placeholder="placeholder || 'dd/mm/yyyy'"
        :required="required"
        :disabled="disabled"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @keydown.enter.prevent="handleBlur"
        maxlength="10"
      />
      <PopoverTrigger as-child>
        <button
          type="button"
          :disabled="disabled"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 disabled:opacity-50"
        >
          <Icon name="lucide:calendar" class="w-4 h-4" />
        </button>
      </PopoverTrigger>
    </div>
    <PopoverContent class="w-auto p-0" align="start">
      <Calendar
        v-model:placeholder="placeholderValue"
        :model-value="calendarValue"
        @update:model-value="handleCalendarSelect"
      />
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { parseDate as parseISODate } from '@internationalized/date'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import type { DateValue } from '@internationalized/date'

interface Props {
  modelValue?: string | null
  id?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'dd/mm/yyyy',
  required: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const displayValue = ref('')
const showCalendar = ref(false)
const placeholderValue = ref<DateValue>()

const inputClasses = computed(() => {
  const baseClasses = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  return props.class ? `${baseClasses} ${props.class}` : baseClasses
})

// Convert ISO date (yyyy-mm-dd) to dd/mm/yyyy
const formatToDisplay = (isoDate: string | null | undefined): string => {
  if (!isoDate) return ''
  try {
    const date = new Date(isoDate)
    if (isNaN(date.getTime())) return ''
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  } catch {
    return ''
  }
}

// Convert dd/mm/yyyy to ISO date (yyyy-mm-dd)
const formatToISO = (displayDate: string): string => {
  if (!displayDate) return ''
  const parts = displayDate.split('/')
  if (parts.length !== 3) return ''

  const dayStr = parts[0]
  const monthStr = parts[1]
  const yearStr = parts[2]

  if (!dayStr || !monthStr || !yearStr) return ''

  const day = parseInt(dayStr, 10)
  const month = parseInt(monthStr, 10)
  const year = parseInt(yearStr, 10)

  if (isNaN(day) || isNaN(month) || isNaN(year)) return ''
  if (day < 1 || day > 31) return ''
  if (month < 1 || month > 12) return ''
  if (year < 1900 || year > 2100) return ''

  const isoMonth = String(month).padStart(2, '0')
  const isoDay = String(day).padStart(2, '0')
  return `${year}-${isoMonth}-${isoDay}`
}

// Convert ISO string to CalendarDate for the calendar component
const calendarValue = computed<DateValue | undefined>(() => {
  const iso = formatToISO(displayValue.value)
  if (!iso) return undefined

  try {
    return parseISODate(iso)
  } catch {
    return undefined
  }
})

// Initialize display value from prop
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    displayValue.value = formatToDisplay(newValue)
  } else {
    displayValue.value = ''
  }
}, { immediate: true })

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/[^\d\/]/g, '') // Only allow digits and /

  // Auto-add slashes
  if (value.length === 2 && !value.includes('/')) {
    value = value + '/'
  } else if (value.length === 5 && value.split('/').length === 2) {
    value = value + '/'
  }

  displayValue.value = value
}

const handleBlur = () => {
  const iso = formatToISO(displayValue.value)
  if (iso) {
    emit('update:modelValue', iso)
  } else if (displayValue.value === '') {
    emit('update:modelValue', '')
  }
}

const handleCalendarSelect = (date: DateValue | undefined) => {
  if (!date) {
    showCalendar.value = false
    return
  }

  // Convert CalendarDate to ISO string (yyyy-mm-dd)
  const isoDate = date.toString()

  displayValue.value = formatToDisplay(isoDate)
  emit('update:modelValue', isoDate)
  showCalendar.value = false
}
</script>
