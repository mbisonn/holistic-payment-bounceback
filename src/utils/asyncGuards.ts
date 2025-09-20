export async function withTimeout<T>(p: PromiseLike<T>, ms = 8000): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)) as Promise<T>,
  ]);
}

export function startLoadingGuard(setLoading: (v: boolean) => void, ms = 10000) {
  const timer = setTimeout(() => setLoading(false), ms);
  return () => {
    try { clearTimeout(timer); } catch {}
  };
}