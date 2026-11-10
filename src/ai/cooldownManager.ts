export interface CooldownEntry {
  until: number;
  reason: string;
}

export class CooldownManager {
  private cooldowns: Map<string, CooldownEntry> = new Map();
  private defaultCooldownMs: number;

  constructor(defaultCooldownMs: number = 60000) {
    this.defaultCooldownMs = defaultCooldownMs;
  }

  private getKey(providerId: string, modelId?: string): string {
    return modelId && modelId !== 'all' ? `${providerId}:${modelId}` : providerId;
  }

  public isCoolingDown(providerId: string, modelId?: string): boolean {
    const now = Date.now();
    // Check specific provider+model key
    if (modelId) {
      const entry = this.cooldowns.get(this.getKey(providerId, modelId));
      if (entry && entry.until > now) {
        return true;
      }
    }
    // Check provider-wide key
    const providerEntry = this.cooldowns.get(providerId);
    if (providerEntry && providerEntry.until > now) {
      return true;
    }
    return false;
  }

  public setCooldown(
    providerId: string,
    modelId: string | undefined,
    durationMs?: number,
    reason: string = 'Temporary error or rate limit'
  ): void {
    const duration = durationMs && durationMs > 0 ? durationMs : this.defaultCooldownMs;
    const until = Date.now() + duration;
    const key = this.getKey(providerId, modelId);
    this.cooldowns.set(key, { until, reason });
  }

  public getCooldownStatus(): Record<string, { coolingDown: boolean; remainingMs: number; reason: string }> {
    const now = Date.now();
    const result: Record<string, { coolingDown: boolean; remainingMs: number; reason: string }> = {};

    for (const [key, entry] of this.cooldowns.entries()) {
      const remaining = Math.max(0, entry.until - now);
      if (remaining > 0) {
        result[key] = {
          coolingDown: true,
          remainingMs: remaining,
          reason: entry.reason,
        };
      }
    }

    return result;
  }

  public resetCooldown(providerId?: string, modelId?: string): void {
    if (!providerId) {
      this.cooldowns.clear();
      return;
    }
    const key = this.getKey(providerId, modelId);
    this.cooldowns.delete(key);
    if (modelId) {
      this.cooldowns.delete(providerId);
    }
  }
}

// Global default instance configured from environment
const defaultMs = parseInt(process.env.AI_PROVIDER_COOLDOWN_DEFAULT_MS || '60000', 10);
export const globalCooldownManager = new CooldownManager(defaultMs);

