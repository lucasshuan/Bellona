export function formatDate(
  date: Date | string | number,
  locale: string = "pt-BR",
  options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
  },
) {
  try {
    const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
    
    return new Intl.DateTimeFormat(locale.replace("_", "-"), options).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(date);
  }
}

export function formatTime(
  date: Date | string | number,
  locale: string = "pt-BR",
) {
  return formatDate(date, locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(
  date: Date | string | number,
  locale: string = "pt-BR",
) {
  return formatDate(date, locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
