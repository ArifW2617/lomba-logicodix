export type ErrorCategory =
  | 'RETRYABLE'
  | 'CONFIGURATION_ERROR'
  | 'NON_RETRYABLE_INPUT'
  | 'INVALID_OUTPUT'
  | 'UNKNOWN';

export interface ClassifiedError {
  category: ErrorCategory;
  statusCode?: number;
  message: string;
  retryAfterSeconds?: number;
  isDailyQuotaExhausted?: boolean;
}

export function classifyError(error: any): ClassifiedError {
  if (!error) {
    return {
      category: 'UNKNOWN',
      message: 'Unknown error occurred',
    };
  }

  const status = error.status || error.statusCode || error.response?.status;
  const rawMsg = String(error.message || error.error?.message || error || '');
  const lowerMsg = rawMsg.toLowerCase();

  // Check if daily quota is exhausted specifically
  const isDailyQuota =
    lowerMsg.includes('generate_content_free_tier_requests') ||
    lowerMsg.includes('generate content requests per day limit') ||
    lowerMsg.includes('quota exceeded for metric') ||
    (status === 429 && lowerMsg.includes('per day'));

  // Extract retry after seconds if available
  let retryAfterSeconds: number | undefined;
  if (error.retryAfter) {
    retryAfterSeconds = parseInt(String(error.retryAfter), 10) || undefined;
  } else if (lowerMsg.includes('retry in ')) {
    const match = lowerMsg.match(/retry in\s+([0-9]+(?:\.[0-9]+)?)(s|m|h)/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      if (unit === 's') retryAfterSeconds = Math.round(val);
      else if (unit === 'm') retryAfterSeconds = Math.round(val * 60);
      else if (unit === 'h') retryAfterSeconds = Math.round(val * 3600);
    }
  }

  // 1. Configuration Errors
  if (
    status === 401 ||
    status === 403 ||
    lowerMsg.includes('api key not valid') ||
    lowerMsg.includes('api_key_invalid') ||
    lowerMsg.includes('invalid api key') ||
    lowerMsg.includes('unauthorized') ||
    lowerMsg.includes('forbidden') ||
    lowerMsg.includes('permission denied') ||
    lowerMsg.includes('model not found') ||
    lowerMsg.includes('does not have access')
  ) {
    return {
      category: 'CONFIGURATION_ERROR',
      statusCode: status || 401,
      message: 'Provider configuration error or invalid API key',
      retryAfterSeconds,
      isDailyQuotaExhausted: false,
    };
  }

  // 2. Non-retryable Input Errors
  if (
    status === 400 ||
    status === 413 ||
    status === 415 ||
    lowerMsg.includes('payload too large') ||
    lowerMsg.includes('invalid argument') ||
    lowerMsg.includes('unsupported media type')
  ) {
    return {
      category: 'NON_RETRYABLE_INPUT',
      statusCode: status || 400,
      message: rawMsg.slice(0, 150),
      retryAfterSeconds: undefined,
      isDailyQuotaExhausted: false,
    };
  }

  // 3. Invalid Output / Parsing Failure
  if (
    lowerMsg.includes('invalid_output') ||
    lowerMsg.includes('unexpected token') ||
    lowerMsg.includes('json parse') ||
    lowerMsg.includes('schema validation')
  ) {
    return {
      category: 'INVALID_OUTPUT',
      statusCode: 200,
      message: rawMsg.slice(0, 150),
      retryAfterSeconds: undefined,
      isDailyQuotaExhausted: false,
    };
  }

  // 4. Retryable / Failover Eligible
  if (
    status === 429 ||
    status === 408 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    lowerMsg.includes('rate limit') ||
    lowerMsg.includes('resource_exhausted') ||
    lowerMsg.includes('timeout') ||
    lowerMsg.includes('aborted') ||
    lowerMsg.includes('connection reset') ||
    lowerMsg.includes('network') ||
    lowerMsg.includes('fetch failed')
  ) {
    let cleanMessage = rawMsg.slice(0, 150);
    if (lowerMsg.includes('aborted') || lowerMsg.includes('timeout')) {
      cleanMessage = rawMsg.includes('antrean') ? rawMsg : 'Request Timeout: Pemrosesan melebihi batas waktu respon (timeout)';
    } else if (isDailyQuota) {
      cleanMessage = 'Daily quota limit reached for this model/provider';
    }

    return {
      category: 'RETRYABLE',
      statusCode: status || 500,
      message: cleanMessage,
      retryAfterSeconds,
      isDailyQuotaExhausted: isDailyQuota,
    };
  }

  return {
    category: 'UNKNOWN',
    statusCode: status,
    message: rawMsg.slice(0, 150),
    retryAfterSeconds,
    isDailyQuotaExhausted: false,
  };
}

