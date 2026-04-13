import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

type Messages = Record<string, unknown>;

const messagesCache = new Map<
  string,
  {
    mtimeMs: number;
    messages: Messages;
  }
>();

async function loadMessages(locale: string) {
  const messagesPath = path.join(process.cwd(), "messages", `${locale}.json`);
  const { mtimeMs } = await stat(messagesPath);
  const cached = messagesCache.get(locale);

  if (cached?.mtimeMs === mtimeMs) {
    return cached.messages;
  }

  const messages = JSON.parse(
    (await readFile(messagesPath, "utf8")).replace(/^\uFEFF/, ""),
  ) as Messages;

  messagesCache.set(locale, {
    mtimeMs,
    messages,
  });

  return messages;
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as "en" | "pt")) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: await loadMessages(locale),
  };
});
