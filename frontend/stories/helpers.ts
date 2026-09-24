import { defineComponent, h, onMounted, ref, type Component } from 'vue'

/**
 * Renders a v-model dialog closed, then opens it after mount — the same false → true change the app makes,
 * so the dialog's "on open" logic (reset the form, load options) runs as it does in the app.
 */
export function openAfterMount(dialog: Component, props: Record<string, unknown> = {}) {
  return () => ({
    components: {
      Harness: defineComponent({
        setup() {
          const open = ref(false)
          onMounted(() => (open.value = true))
          return () => h(dialog, { ...props, modelValue: open.value, 'onUpdate:modelValue': (v: boolean) => (open.value = v) })
        },
      }),
    },
    template: '<Harness />',
  })
}
