<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="auth">
    <!-- 30% cấu trúc: dải Nâu Đất mang nhận diện, họa tiết ruộng bậc thang như bìa design system -->
    <aside class="identity">
      <div class="words">
        <BrandMark :size="40" />
        <p class="display">{{ t('app.name') }}</p>
        <p class="tagline">{{ t('app.tagline') }}</p>
      </div>
      <svg class="terraces" viewBox="0 0 480 288" aria-hidden="true" preserveAspectRatio="xMaxYMax meet">
        <circle class="gold" cx="424" cy="40" r="24" />
        <rect class="amber" x="256" y="72" width="240" height="32" rx="6" />
        <rect class="clay" x="160" y="112" width="336" height="48" rx="6" />
        <rect class="gold" x="64" y="168" width="432" height="56" rx="6" />
        <rect class="deep" x="0" y="232" width="496" height="64" rx="6" />
      </svg>
    </aside>
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.auth {
  display: grid;
  grid-template-columns: minmax(320px, 5fr) 7fr;
  min-height: 100vh;
  background: var(--ground);
}

.identity {
  position: relative;
  padding: var(--space-8) var(--space-6);
  overflow: hidden;
  background: var(--umber);
  color: var(--on-umber);
}

.terraces {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 78%;
  max-width: 480px;
  height: auto;
}

.gold {
  fill: var(--ochre);
}

.amber {
  fill: var(--ochre-hover);
}

.clay {
  fill: var(--umber-soft);
}

.deep {
  fill: var(--on-umber);
  opacity: 0.12;
}

.words {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 360px;
}

.display {
  margin: var(--space-3) 0 0;
  font-size: 32px;
  font-weight: 700;
  line-height: 40px;
  letter-spacing: -0.01em;
  text-wrap: balance;
}

.tagline {
  margin: 0;
  color: var(--on-umber-muted);
}

.content {
  display: grid;
  place-items: center;
  padding: var(--space-6) var(--space-4);
}

@media (max-width: 860px) {
  .auth {
    grid-template-columns: 1fr;
  }

  .identity {
    min-height: 200px;
    padding: var(--space-5);
  }

  .terraces {
    width: 55%;
  }

  .tagline {
    display: none;
  }
}
</style>
