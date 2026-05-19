const SHANGHAI_TZ = 'Asia/Shanghai';

type DateInput = string | number | Date | null | undefined;

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

function toDate(value: DateInput): Date | null {
  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  if (typeof value === 'number') {
    const parsed = new Date(value);
    return isValidDate(parsed) ? parsed : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const hasTimeZone = /([zZ]|[+-]\d{2}:\d{2})$/.test(trimmed);
  if (hasTimeZone) {
    const parsed = new Date(trimmed);
    return isValidDate(parsed) ? parsed : null;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = new Date(`${trimmed}T00:00:00Z`);
    return isValidDate(parsed) ? parsed : null;
  }

  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(trimmed)) {
    const normalized = `${trimmed.replace(' ', 'T')}Z`;
    const parsed = new Date(normalized);
    return isValidDate(parsed) ? parsed : null;
  }

  const parsed = new Date(trimmed);
  return isValidDate(parsed) ? parsed : null;
}

function formatParts(date: Date, options: Intl.DateTimeFormatOptions) {
  const formatter = new Intl.DateTimeFormat('zh-CN', {
    timeZone: SHANGHAI_TZ,
    ...options
  });

  const parts = formatter.formatToParts(date);
  const values: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== 'literal') {
      values[part.type] = part.value;
    }
  }

  return values;
}

export function formatDateYmd(value: DateInput) {
  const date = toDate(value);
  if (!date) {
    return '';
  }

  const parts = formatParts(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatDateLongZh(value: DateInput) {
  const date = toDate(value);
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: SHANGHAI_TZ,
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

export function formatDateTimeZh(value: DateInput) {
  const date = toDate(value);
  if (!date) {
    return '';
  }

  const parts = formatParts(date, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}:${parts.second}`;
}
