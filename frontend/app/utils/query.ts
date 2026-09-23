/** Bỏ các giá trị rỗng để không gửi `?search=&classId=` lên API. */
export function cleanQuery<T extends object>(query: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as Partial<T>
}
