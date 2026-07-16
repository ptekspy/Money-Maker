export function env(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function requiredEnv(name: string): string {
  const value = env(name);
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

export function appUrl(fallback?: string): string {
  return (env("CONTRACTGUARD_APP_URL") || fallback || "").replace(/\/$/, "");
}

export function githubAppSlug(): string {
  return env("CONTRACTGUARD_GITHUB_APP_SLUG") || "api-contract-guard";
}
