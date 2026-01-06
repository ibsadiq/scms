<template>
  <div class="rich-text-editor">
    <!-- Toolbar -->
    <div v-if="editor" class="toolbar border border-neutral-300 dark:border-neutral-600 border-b-0 rounded-t-md bg-neutral-50 dark:bg-neutral-800 p-2 flex flex-wrap gap-1">
      <!-- Text Formatting -->
      <button
        type="button"
        @click="editor.chain().focus().toggleBold().run()"
        :class="{ 'is-active': editor.isActive('bold') }"
        class="toolbar-btn"
        title="Bold"
      >
        <Icon name="lucide:bold" class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleItalic().run()"
        :class="{ 'is-active': editor.isActive('italic') }"
        class="toolbar-btn"
        title="Italic"
      >
        <Icon name="lucide:italic" class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleUnderline().run()"
        :class="{ 'is-active': editor.isActive('underline') }"
        class="toolbar-btn"
        title="Underline"
      >
        <Icon name="lucide:underline" class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleStrike().run()"
        :class="{ 'is-active': editor.isActive('strike') }"
        class="toolbar-btn"
        title="Strikethrough"
      >
        <Icon name="lucide:strikethrough" class="w-4 h-4" />
      </button>

      <div class="w-px h-6 bg-neutral-300 dark:bg-neutral-600"></div>

      <!-- Headings -->
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        class="toolbar-btn"
        title="Heading 1"
      >
        <Icon name="lucide:heading-1" class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        class="toolbar-btn"
        title="Heading 2"
      >
        <Icon name="lucide:heading-2" class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
        :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        class="toolbar-btn"
        title="Heading 3"
      >
        <Icon name="lucide:heading-3" class="w-4 h-4" />
      </button>

      <div class="w-px h-6 bg-neutral-300 dark:bg-neutral-600"></div>

      <!-- Lists -->
      <button
        type="button"
        @click="editor.chain().focus().toggleBulletList().run()"
        :class="{ 'is-active': editor.isActive('bulletList') }"
        class="toolbar-btn"
        title="Bullet List"
      >
        <Icon name="lucide:list" class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleOrderedList().run()"
        :class="{ 'is-active': editor.isActive('orderedList') }"
        class="toolbar-btn"
        title="Numbered List"
      >
        <Icon name="lucide:list-ordered" class="w-4 h-4" />
      </button>

      <div class="w-px h-6 bg-neutral-300 dark:bg-neutral-600"></div>

      <!-- Alignment -->
      <button
        type="button"
        @click="editor.chain().focus().setTextAlign('left').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }"
        class="toolbar-btn"
        title="Align Left"
      >
        <Icon name="lucide:align-left" class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().setTextAlign('center').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }"
        class="toolbar-btn"
        title="Align Center"
      >
        <Icon name="lucide:align-center" class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().setTextAlign('right').run()"
        :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }"
        class="toolbar-btn"
        title="Align Right"
      >
        <Icon name="lucide:align-right" class="w-4 h-4" />
      </button>

      <div class="w-px h-6 bg-neutral-300 dark:bg-neutral-600"></div>

      <!-- Other -->
      <button
        type="button"
        @click="editor.chain().focus().toggleBlockquote().run()"
        :class="{ 'is-active': editor.isActive('blockquote') }"
        class="toolbar-btn"
        title="Quote"
      >
        <Icon name="lucide:quote" class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().toggleCodeBlock().run()"
        :class="{ 'is-active': editor.isActive('codeBlock') }"
        class="toolbar-btn"
        title="Code Block"
      >
        <Icon name="lucide:code" class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().setHorizontalRule().run()"
        class="toolbar-btn"
        title="Horizontal Rule"
      >
        <Icon name="lucide:minus" class="w-4 h-4" />
      </button>

      <div class="w-px h-6 bg-neutral-300 dark:bg-neutral-600"></div>

      <!-- Undo/Redo -->
      <button
        type="button"
        @click="editor.chain().focus().undo().run()"
        :disabled="!editor.can().undo()"
        class="toolbar-btn"
        title="Undo"
      >
        <Icon name="lucide:undo" class="w-4 h-4" />
      </button>
      <button
        type="button"
        @click="editor.chain().focus().redo().run()"
        :disabled="!editor.can().redo()"
        class="toolbar-btn"
        title="Redo"
      >
        <Icon name="lucide:redo" class="w-4 h-4" />
      </button>
    </div>

    <!-- Editor Content -->
    <EditorContent
      :editor="editor"
      class="editor-content border border-neutral-300 dark:border-neutral-600 rounded-b-md bg-white dark:bg-neutral-900 min-h-[200px] max-h-[400px] overflow-y-auto"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm dark:prose-invert max-w-none p-4 focus:outline-none',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  const isSame = editor.value?.getHTML() === newValue
  if (!isSame && newValue !== editor.value?.getHTML()) {
    editor.value?.commands.setContent(newValue, false)
  }
})

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.toolbar-btn {
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.toolbar-btn:hover {
  background-color: rgb(229 231 235);
}

.dark .toolbar-btn:hover {
  background-color: rgb(55 65 81);
}

.toolbar-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.toolbar-btn.is-active {
  background-color: rgb(229 231 235);
}

.dark .toolbar-btn.is-active {
  background-color: rgb(55 65 81);
}

:deep(.editor-content) {
  .ProseMirror {
    min-height: 200px;
    outline: none;
  }

  .ProseMirror p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: attr(data-placeholder);
    float: left;
    height: 0;
    pointer-events: none;
  }

  /* Prose styles */
  .ProseMirror h1 {
    font-size: 2em;
    font-weight: 700;
    margin-top: 0.67em;
    margin-bottom: 0.67em;
  }

  .ProseMirror h2 {
    font-size: 1.5em;
    font-weight: 700;
    margin-top: 0.75em;
    margin-bottom: 0.75em;
  }

  .ProseMirror h3 {
    font-size: 1.17em;
    font-weight: 700;
    margin-top: 0.83em;
    margin-bottom: 0.83em;
  }

  .ProseMirror ul,
  .ProseMirror ol {
    padding-left: 1.5em;
    margin: 1em 0;
  }

  .ProseMirror ul {
    list-style-type: disc;
  }

  .ProseMirror ol {
    list-style-type: decimal;
  }

  .ProseMirror blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1em;
    margin: 1em 0;
    font-style: italic;
  }

  .dark .ProseMirror blockquote {
    border-left-color: #374151;
  }

  .ProseMirror code {
    background-color: #f3f4f6;
    padding: 0.2em 0.4em;
    border-radius: 0.25em;
    font-family: monospace;
  }

  .dark .ProseMirror code {
    background-color: #1f2937;
  }

  .ProseMirror pre {
    background-color: #1f2937;
    color: #f3f4f6;
    padding: 1em;
    border-radius: 0.5em;
    overflow-x: auto;
    margin: 1em 0;
  }

  .ProseMirror pre code {
    background-color: transparent;
    padding: 0;
    color: inherit;
  }

  .ProseMirror hr {
    border: none;
    border-top: 2px solid #e5e7eb;
    margin: 2em 0;
  }

  .dark .ProseMirror hr {
    border-top-color: #374151;
  }
}
</style>
