// Sinh app/assets/css/tokens.css từ design-system/tokens.json (nguồn duy nhất của design system Hoàng Thổ).
// Chạy: pnpm tokens
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export function renderTokensCss(t) {
  const themed = [...t.color.tokens, ...t.shadow.tokens]
  const decl = (theme) => themed.map((x) => `  --${x.name}: ${typeof x.value === 'string' ? x.value : x.value[theme]};`)
  const common = [
    ...['spacing', 'radius'].flatMap((family) => t[family].tokens.map((x) => `  --${x.name}: ${x.value};`)),
    ...Object.entries(t.type.families).map(([key, stack]) => `  --font-${key}: ${stack};`),
  ]
  return [
    '/* Hoàng Thổ design system tokens — sinh từ design-system/tokens.json bằng `pnpm tokens`, không sửa tay. */',
    ':root {',
    '  color-scheme: light;',
    ...decl('light'),
    ...common,
    '}',
    '',
    'html.dark {',
    '  color-scheme: dark;',
    ...decl('dark'),
    '}',
    '',
  ].join('\n')
}

// Chỉ ghi file khi chạy trực tiếp (`pnpm tokens`); khi được import (test) thì chỉ dùng renderTokensCss
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const tokens = JSON.parse(readFileSync(resolve(root, 'design-system/tokens.json'), 'utf8'))
  writeFileSync(resolve(root, 'app/assets/css/tokens.css'), renderTokensCss(tokens))
  console.log('✔ app/assets/css/tokens.css')
}
