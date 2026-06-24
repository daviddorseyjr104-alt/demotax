/* Treat unconfigured / placeholder env values as "not set", so routes return a
 * clean 503 ("not configured") instead of firing doomed API calls or redirecting
 * to a provider with a fake client_id. Placeholders are the `your-…` / `change-me…`
 * sample values shipped in .env.local. */

export function envValue(name: string): string | undefined {
  const v = process.env[name]?.trim();
  if (!v) return undefined;
  const lower = v.toLowerCase();
  if (lower.startsWith('your-') || lower.startsWith('change-me') || lower.includes('-here')) {
    return undefined;
  }
  return v;
}
