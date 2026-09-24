import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { reactive } from 'vue'
import ListPagination from '~/components/ListPagination.vue'

/**
 * `ListPagination`: the pagination under every list screen: total, rows per page, pages. It wraps `ElPagination` and
 * gives the rows-per-page select an accessible name, which Element Plus does not provide.
 * The current page is bold `ochre-ink` text, not a filled block.
 */
const meta = {
  title: 'Components/Navigation/Pagination',
  component: ListPagination,
} satisfies Meta<typeof ListPagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { page: 1, pageSize: 10, total: 48 },
  render: (args) => ({
    components: { ListPagination },
    setup: () => ({ q: reactive({ ...args }) }),
    template: '<ListPagination v-model:page="q.page" v-model:page-size="q.pageSize" :total="q.total" />',
  }),
}

/** Many pages collapse around the current one. */
export const ManyPages: Story = {
  ...Default,
  args: { page: 7, pageSize: 10, total: 420 },
}

/** A short list still shows the total, so "4 results" is never a guess. */
export const SinglePage: Story = {
  ...Default,
  args: { page: 1, pageSize: 10, total: 4 },
}
