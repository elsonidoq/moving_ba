/** Resolve canonical public paths without changing content or saved snapshots. */
export function publicUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
