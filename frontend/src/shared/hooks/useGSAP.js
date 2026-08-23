import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

/**
 * useGSAP — wraps GSAP's gsap.context() for safe, scoped animations.
 * Accepts a factory function that receives the GSAP context (self) as its argument,
 * automatically cleans up all tweens/timelines on unmount via ctx.revert(),
 * and re-runs whenever deps change.
 *
 * WHY self instead of ctx:
 * gsap.context(callback) runs the callback synchronously during construction.
 * If you reference the `const ctx` variable inside that same callback, you hit
 * JavaScript's Temporal Dead Zone (TDZ) — `ctx` is not yet assigned.
 * GSAP passes the fully-initialized context as the first argument (`self`),
 * so we forward that to the factory instead.
 *
 * Usage in components:
 *   const { containerRef } = useGSAP((self) => {
 *     self.add(() => {
 *       gsap.from('.my-el', { opacity: 0, duration: 0.5 })
 *     })
 *   }, [])
 *
 * @param {Function} factory - (self: GSAPContext) => void — defines GSAP tweens
 * @param {Array}    deps    - dependency array (like useEffect)
 * @returns {{ containerRef }} - ref to attach to the root DOM element for scope
 */
export function useGSAP(factory, deps = []) {
  const containerRef = useRef(null)

  useEffect(() => {
    // GSAP passes the fully-initialized context as `self` — no TDZ issue here
    const ctx = gsap.context((self) => {
      factory(self)
    }, containerRef)

    // Revert (clean up) all tweens created inside this context on unmount
    return () => ctx.revert()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { containerRef }
}
