import { parse as parseYaml } from "yaml";
import { compareContracts } from "@/lib/contract-diff";
import {
  getInstallation,
  hasEntitlement,
  recordCheck,
  saveRepository,
} from "@/lib/data";
import { appUrl } from "@/lib/env";
import { githubFetch, installationToken } from "@/lib/github";

export type PullRequestJob = {
  installationId: number;
  repositoryId: number;
  fullName: string;
  private: boolean;
  pullRequestNumber: number;
  baseSha: string;
  headSha: string;
};

type Tree = { tree: Array<{ path: string; type: string }> };

function candidateScore(path: string) {
  const normalized = path.toLowerCase();
  const name = normalized.split("/").at(-1) ?? "";
  if (!/^(openapi|swagger)(\.(v\d+|\d+))?\.(json|ya?ml)$/.test(name)) return -1;
  if (normalized.includes("node_modules/") || normalized.includes("vendor/"))
    return -1;
  return normalized.includes("docs/")
    ? 1
    : normalized.split("/").length === 1
      ? 3
      : 2;
}

async function findSpecPath(repo: string, sha: string, token: string) {
  const tree = await githubFetch<Tree>(
    `/repos/${repo}/git/trees/${sha}?recursive=1`,
    token,
  );
  return tree.tree
    .filter((entry) => entry.type === "blob" && candidateScore(entry.path) >= 0)
    .sort((a, b) => candidateScore(b.path) - candidateScore(a.path))[0]?.path;
}

async function readFile(
  repo: string,
  path: string,
  sha: string,
  token: string,
) {
  const response = await fetch(
    `https://api.github.com/repos/${repo}/contents/${path
      .split("/")
      .map(encodeURIComponent)
      .join("/")}?ref=${sha}`,
    {
      headers: {
        Accept: "application/vnd.github.raw+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2026-03-10",
        "User-Agent": "API-Contract-Guard",
      },
    },
  );
  if (!response.ok) throw new Error(`Could not read ${path} at ${sha}`);
  return response.text();
}

function parseContract(text: string, path: string) {
  return path.endsWith(".json") ? JSON.parse(text) : parseYaml(text);
}

async function createCheck(
  job: PullRequestJob,
  token: string,
  input: {
    conclusion: "success" | "failure" | "neutral" | "action_required";
    title: string;
    summary: string;
    text?: string;
  },
) {
  await githubFetch(`/repos/${job.fullName}/check-runs`, token, {
    method: "POST",
    body: JSON.stringify({
      name: "API Contract Guard",
      head_sha: job.headSha,
      status: "completed",
      conclusion: input.conclusion,
      details_url: `${appUrl("https://app.apicontractguard.com")}/dashboard`,
      output: {
        title: input.title,
        summary: input.summary,
        text: input.text?.slice(0, 60000),
      },
    }),
  });
}

export async function processPullRequest(job: PullRequestJob) {
  const token = await installationToken(job.installationId);
  await saveRepository({
    installationId: job.installationId,
    repositoryId: job.repositoryId,
    fullName: job.fullName,
    private: job.private,
  });

  const installation = await getInstallation(job.installationId);
  if (!hasEntitlement(installation)) {
    await createCheck(job, token, {
      conclusion: "action_required",
      title: "Trial ended",
      summary:
        "API Contract Guard is paused for this installation. Open the dashboard to activate automated checks.",
    });
    return;
  }

  const [basePath, headPath] = await Promise.all([
    findSpecPath(job.fullName, job.baseSha, token),
    findSpecPath(job.fullName, job.headSha, token),
  ]);
  if (!basePath || !headPath || basePath !== headPath) {
    await createCheck(job, token, {
      conclusion: "neutral",
      title: "No matching API contract found",
      summary:
        "Add openapi.json, openapi.yaml, openapi.yml, swagger.json, swagger.yaml or swagger.yml to both branches.",
    });
    await recordCheck({ ...job, conclusion: "neutral", breakingChanges: 0 });
    return;
  }

  const [baseText, headText] = await Promise.all([
    readFile(job.fullName, basePath, job.baseSha, token),
    readFile(job.fullName, headPath, job.headSha, token),
  ]);
  const changes = compareContracts(
    parseContract(baseText, basePath),
    parseContract(headText, headPath),
  );
  const breaking = changes.filter((change) => change.severity === "breaking");
  const text = changes.length
    ? changes
        .slice(0, 50)
        .map(
          (change) =>
            `- **${change.severity.toUpperCase()}** \`${change.location}\` — ${change.message}`,
        )
        .join("\n")
    : "No contract changes detected.";

  await createCheck(job, token, {
    conclusion: breaking.length ? "failure" : "success",
    title: breaking.length
      ? `${breaking.length} breaking API change${breaking.length === 1 ? "" : "s"}`
      : "No breaking API changes",
    summary: `${changes.length} contract change${changes.length === 1 ? "" : "s"} found in ${basePath}.`,
    text,
  });
  await recordCheck({
    ...job,
    conclusion: breaking.length ? "failure" : "success",
    breakingChanges: breaking.length,
    specPath: basePath,
  });
}
