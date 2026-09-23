export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (to.meta.public) {
    return to.path === '/login' && auth.isAuthenticated ? navigateTo(auth.homePath) : undefined
  }

  if (!auth.isAuthenticated) {
    auth.clear()
    return navigateTo({ path: '/login', query: to.fullPath === '/' ? {} : { redirect: to.fullPath } })
  }

  if (to.meta.roles && !auth.hasRole(...to.meta.roles)) {
    return navigateTo('/forbidden')
  }
})
