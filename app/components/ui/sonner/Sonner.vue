<script lang="ts" setup>
import type { ToasterProps } from "vue-sonner"
import { Toaster as Sonner } from "vue-sonner"

const props = defineProps<ToasterProps>()
</script>

<template>
  <Sonner
    class="toaster group"
    v-bind="props"
    :style="{
      '--normal-bg': 'hsl(var(--background))',
      '--normal-text': 'hsl(var(--foreground))',
      '--normal-border': 'hsl(var(--border))',
      '--success-bg': 'hsl(var(--success))',
      '--success-text': 'hsl(var(--success-foreground))',
      '--success-border': 'hsl(var(--success))',
      '--error-bg': 'hsl(var(--destructive))',
      '--error-text': 'hsl(var(--destructive-foreground))',
      '--error-border': 'hsl(var(--destructive))',
      '--warning-bg': 'hsl(var(--warning))',
      '--warning-text': 'hsl(var(--warning-foreground))',
      '--warning-border': 'hsl(var(--warning))',
      '--info-bg': 'hsl(var(--info))',
      '--info-text': 'hsl(var(--info-foreground))',
      '--info-border': 'hsl(var(--info))',
    }"
  />
</template>

<style>
/* Toast positioning and layout */
.toaster {
  --width: 356px;
  --font-family: inherit;
  --toast-gap: 0.5rem;
}

/* Global override for all data-sonner-toaster elements */
[data-sonner-toaster] {
  position: fixed !important;
  z-index: 99999 !important;
  pointer-events: none !important;
  display: flex !important;
  flex-direction: column !important;
  gap: var(--toast-gap) !important;
}

/* Make individual toasts clickable */
[data-sonner-toast] {
  pointer-events: auto !important;
}

/* CRITICAL: Force top-right positioning with maximum specificity */
body [data-sonner-toaster][data-position="top-right"],
body ol[data-sonner-toaster][data-position="top-right"] {
  top: 16px !important;
  right: 16px !important;
  left: auto !important;
  bottom: auto !important;
  inset: unset !important;
  transform: none !important;
  margin: 0 !important;
  padding: 0 !important;
}

[data-sonner-toaster][data-position="top-center"] {
  top: 0 !important;
  left: 50% !important;
  right: auto !important;
  bottom: auto !important;
  transform: translateX(-50%) !important;
  padding: 1rem !important;
}

[data-sonner-toaster][data-position="top-left"] {
  top: 0 !important;
  left: 0 !important;
  right: auto !important;
  bottom: auto !important;
  padding: 1rem !important;
}

[data-sonner-toaster][data-position="bottom-right"] {
  bottom: 0 !important;
  right: 0 !important;
  top: auto !important;
  left: auto !important;
  padding: 1rem !important;
}

[data-sonner-toaster][data-position="bottom-center"] {
  bottom: 0 !important;
  left: 50% !important;
  top: auto !important;
  right: auto !important;
  transform: translateX(-50%) !important;
  padding: 1rem !important;
}

[data-sonner-toaster][data-position="bottom-left"] {
  bottom: 0 !important;
  left: 0 !important;
  top: auto !important;
  right: auto !important;
  padding: 1rem !important;
}

/* Base toast styles */
:where([data-sonner-toast]) {
  min-width: var(--width);
  max-width: var(--width);
  font-family: var(--font-family);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.15);
  padding: 1rem;
  border: 1px solid var(--normal-border);
  background: var(--normal-bg);
  color: var(--normal-text);
}

/* Title and description styles */
:where([data-sonner-toast] [data-title]) {
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.25rem;
}

:where([data-sonner-toast] [data-description]) {
  font-size: 0.8125rem;
  line-height: 1.125rem;
  opacity: 0.9;
  margin-top: 0.25rem;
}

/* Success toast styles */
:where([data-sonner-toast][data-type="success"]) {
  background: hsl(142 76% 95%);
  border-color: hsl(142 76% 36%);
  color: hsl(142 76% 26%);
}

:where([data-sonner-toast][data-type="success"] [data-icon]) {
  color: hsl(142 76% 36%);
}

/* Dark mode success */
:where(.dark [data-sonner-toast][data-type="success"]) {
  background: hsl(142 76% 12%);
  border-color: hsl(142 76% 36%);
  color: hsl(142 76% 90%);
}

/* Error toast styles */
:where([data-sonner-toast][data-type="error"]) {
  background: hsl(0 84% 95%);
  border-color: hsl(0 84% 60%);
  color: hsl(0 84% 35%);
}

:where([data-sonner-toast][data-type="error"] [data-icon]) {
  color: hsl(0 84% 60%);
}

/* Dark mode error */
:where(.dark [data-sonner-toast][data-type="error"]) {
  background: hsl(0 84% 12%);
  border-color: hsl(0 84% 60%);
  color: hsl(0 84% 90%);
}

/* Warning toast styles */
:where([data-sonner-toast][data-type="warning"]) {
  background: hsl(38 92% 95%);
  border-color: hsl(38 92% 50%);
  color: hsl(38 92% 30%);
}

:where([data-sonner-toast][data-type="warning"] [data-icon]) {
  color: hsl(38 92% 50%);
}

/* Dark mode warning */
:where(.dark [data-sonner-toast][data-type="warning"]) {
  background: hsl(38 92% 12%);
  border-color: hsl(38 92% 50%);
  color: hsl(38 92% 90%);
}

/* Info toast styles */
:where([data-sonner-toast][data-type="info"]) {
  background: hsl(199 89% 95%);
  border-color: hsl(199 89% 48%);
  color: hsl(199 89% 28%);
}

:where([data-sonner-toast][data-type="info"] [data-icon]) {
  color: hsl(199 89% 48%);
}

/* Dark mode info */
:where(.dark [data-sonner-toast][data-type="info"]) {
  background: hsl(199 89% 12%);
  border-color: hsl(199 89% 48%);
  color: hsl(199 89% 90%);
}

/* Loading toast */
:where([data-sonner-toast][data-type="loading"]) {
  background: var(--normal-bg);
  border-color: var(--normal-border);
  color: var(--normal-text);
}

/* Close button */
:where([data-sonner-toast] [data-close-button]) {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

:where([data-sonner-toast] [data-close-button]):hover {
  opacity: 1;
}

/* Animation improvements */
:where([data-sonner-toast]) {
  transition: all 0.2s ease-in-out;
}

:where([data-sonner-toast][data-mounted="true"]) {
  animation: slideIn 0.2s ease-in-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .toaster {
    --width: calc(100vw - 2rem);
  }

  :where([data-sonner-toast]) {
    min-width: var(--width);
    max-width: var(--width);
    margin: 0 1rem;
  }
}
</style>
