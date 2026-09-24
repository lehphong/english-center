<script setup lang="ts">
import tokens from '../../design-system/tokens.json'
</script>

<template>
  <div class="wrap">
    <section>
      <h3>Spacing — 4px grid</h3>
      <div v-for="s in tokens.spacing.tokens" :key="s.name" class="row">
        <span class="code">{{ s.name }} · {{ s.value }}</span>
        <span class="bar" :style="{ width: s.value }" />
        <span class="usage">{{ s.usage }}</span>
      </div>
    </section>
    <section>
      <h3>Radius — steady earth, tight corners</h3>
      <div class="shapes">
        <div v-for="r in tokens.radius.tokens" :key="r.name" class="shape-item">
          <div class="shape" :style="{ borderRadius: r.value }" />
          <strong>{{ r.name }}</strong>
          <span class="code">{{ r.value }}</span>
          <span class="usage">{{ r.usage }}</span>
        </div>
      </div>
    </section>
    <section>
      <h3>Shadow</h3>
      <div class="shapes">
        <div v-for="s in tokens.shadow.tokens" :key="s.name" class="shape-item">
          <div class="shape raised" :style="{ boxShadow: `var(--${s.name})` }" />
          <strong>{{ s.name }}</strong>
          <span class="usage">{{ s.usage }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  color: var(--ink);
  font-family: var(--font-sans);
}

h3 {
  margin: 0 0 var(--space-3);
  font-size: 16px;
}

.row {
  display: grid;
  grid-template-columns: 130px 64px 1fr;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-2) 0;
}

.bar {
  height: 12px;
  background: var(--ochre);
  border-radius: 2px;
}

.shapes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-4);
}

.shape-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.shape {
  width: 96px;
  height: 64px;
  margin-bottom: var(--space-2);
  background: var(--ochre-soft);
  border: 2px solid var(--ochre-ink);
}

.shape.raised {
  background: var(--surface);
  border: none;
  border-radius: var(--radius-md);
}

.usage {
  font-size: 12px;
  line-height: 18px;
  color: var(--ink-muted);
}
</style>
