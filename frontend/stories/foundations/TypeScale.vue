<script setup lang="ts">
import tokens from '../../design-system/tokens.json'

const families = tokens.type.families as Record<string, string>
const groups = tokens.type.groups.map((g) => ({
  ...g,
  styles: g.styles.map((s) => ({
    ...s,
    css: {
      fontFamily: families[g.family],
      fontSize: s.fontSize,
      lineHeight: s.lineHeight,
      fontWeight: s.fontWeight,
      letterSpacing: 'letterSpacing' in s ? (s.letterSpacing as string) : undefined,
      textTransform: s.name === 'label' ? ('uppercase' as const) : undefined,
      fontVariantNumeric: g.family === 'mono' ? 'tabular-nums' : undefined,
    },
  })),
}))
</script>

<template>
  <div class="scale">
    <section v-for="group in groups" :key="group.name">
      <h3>{{ group.name }} <span class="code">{{ families[group.family] }}</span></h3>
      <div v-for="style in group.styles" :key="style.name" class="row">
        <div class="spec">
          <strong>{{ style.name }}</strong>
          <span class="code">{{ style.fontSize }} / {{ style.lineHeight }} · {{ style.fontWeight }}</span>
        </div>
        <div>
          <p class="sample" :style="style.css">{{ style.sample }}</p>
          <p class="usage">{{ style.usage }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.scale {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
  color: var(--ink);
  font-family: var(--font-sans);
}

h3 {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  align-items: baseline;
  margin: 0 0 var(--space-2);
  font-size: 16px;
}

.row {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-top: 1px solid var(--line);
}

.spec {
  display: flex;
  flex-direction: column;
}

.sample {
  margin: 0;
}

.usage {
  margin: var(--space-1) 0 0;
  font-size: 12px;
  color: var(--ink-muted);
}
</style>
