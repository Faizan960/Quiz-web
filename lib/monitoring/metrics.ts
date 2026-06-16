// ─────────────────────────────────────────────────
// Quizly — Performance Metrics & Telemetry
// ─────────────────────────────────────────────────

import { logInfo } from './errors'

interface MetricTags {
  path?: string
  method?: string
  status?: string
  dimension?: string
  archetype?: string
  category?: string
  [key: string]: string | undefined
}

/**
 * Tracks a custom metric and prints it as a structured log.
 * In a real production deployment, this can hook into Datadog, Prometheus, or Google Cloud Monitoring.
 */
export function trackMetric(
  name: string,
  value: number,
  tags: MetricTags = {}
): void {
  logInfo(`metric.${name}`, {
    metric_name: name,
    metric_value: value,
    ...tags,
  })
}

/**
 * Convenience method to increment a counter metric.
 */
export function incrementCounter(name: string, tags: MetricTags = {}): void {
  trackMetric(name, 1, tags)
}

/**
 * Utility to measure execution time of code blocks or API handlers.
 * Usage:
 *   const stop = measureLatency('api.request', { path: '/api/responses' })
 *   // ... do work ...
 *   stop()
 */
export function measureLatency(name: string, tags: MetricTags = {}): () => void {
  const start = process.hrtime.bigint()

  return () => {
    const end = process.hrtime.bigint()
    // Convert nanoseconds to milliseconds
    const durationMs = Number(end - start) / 1_000_000
    trackMetric(`${name}.latency_ms`, durationMs, tags)
  }
}
