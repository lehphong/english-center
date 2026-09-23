import type { UserRole } from './enums'

declare module '#app' {
  interface PageMeta {
    /** Trang không cần đăng nhập */
    public?: boolean
    /** Vai trò được phép vào trang; bỏ trống = mọi người đã đăng nhập */
    roles?: UserRole[]
  }
}

export {}
