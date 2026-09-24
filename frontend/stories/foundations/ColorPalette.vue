<script setup lang="ts">
import tokens from '../../design-system/tokens.json'

interface ColorToken {
  name: string
  value: { light: string; dark: string }
  usage: string
}

const byName = Object.fromEntries((tokens.color.tokens as ColorToken[]).map((t) => [t.name, t]))

// Grouped by role in the 60 – 30 – 10 rule
const groups = [
  { title: 'Ground — 60%', names: ['ground', 'surface', 'surface-sunken', 'line', 'line-strong'] },
  { title: 'Structure — 30% (earth brown and text)', names: ['umber', 'umber-soft', 'on-umber', 'on-umber-muted', 'ink', 'ink-muted', 'ink-subtle'] },
  { title: 'Accent — 10% (golden ochre)', names: ['ochre', 'ochre-hover', 'ochre-soft', 'ochre-ink', 'on-ochre', 'focus-ring'] },
  {
    title: 'Semantic — only when data has a state',
    names: ['success', 'success-soft', 'warning', 'warning-soft', 'danger', 'danger-soft', 'on-danger', 'info', 'info-soft'],
  },
].map((g) => ({ ...g, tokens: g.names.map((n) => byName[n]!) }))

/** Split a usage note into plain text and token names (written in `…`) so names render as code */
const parts = (usage: string) => usage.split(/`([^`]+)`/).map((text, i) => ({ text, code: i % 2 === 1 }))
</script>

<template>
  <div class="palette">
    <figure class="ratio" aria-label="60 – 30 – 10 ratio">
      <span style="flex: 60; background: var(--ground)">60% ground</span>
      <span style="flex: 30; background: var(--umber); color: var(--on-umber)">30% umber</span>
      <span style="flex: 10; background: var(--ochre); color: var(--on-ochre)">10%</span>
    </figure>

    <section v-for="group in groups" :key="group.title">
      <h3>{{ group.title }}</h3>
      <div class="grid">
        <article v-for="token in group.tokens" :key="token.name" class="swatch">
          <div class="chip" :style="{ background: `var(--${token.name})` }" />
          <div class="meta">
            <strong>{{ token.name }}</strong>
            <span class="code">{{ token.value.light }} · {{ token.value.dark }}</span>
            <p>
              <template v-for="(part, i) in parts(token.usage)" :key="i">
                <code v-if="part.code">{{ part.text }}</code>
                <template v-else>{{ part.text }}</template>
              </template>
            </p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.palette {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  font-family: var(--font-sans);
  color: var(--ink);
}

.ratio {
  display: flex;
  height: 48px;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.ratio span {
  display: flex;
  align-items: center;
  padding: 0 var(--space-3);
  font-size: 12px;
  font-weight: 600;
}

h3 {
  margin: 0 0 var(--space-3);
  font-size: 16px;
  font-weight: 600;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: var(--space-3);
}

.swatch {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
}

.chip {
  flex: none;
  width: 48px;
  height: 48px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.meta code {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink);
}

.meta p {
  margin: var(--space-1) 0 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--ink-muted);
}
</style>
