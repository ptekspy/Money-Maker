"use client";

import { useState } from "react";
import { parse } from "yaml";
import { trackEvent } from "@/lib/analytics";
import { type ContractChange, compareContracts } from "@/lib/contract-diff";

const installUrl =
  "https://app.apicontractguard.com/api/auth/github/start?source=website&campaign=checker_result";

const baselineExample = `openapi: 3.0.3
info: { title: Orders API, version: 1.0.0 }
paths:
  /orders/{id}:
    get:
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
      responses:
        "200":
          description: An order
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: { type: string }
                  status: { type: string, enum: [pending, paid, shipped] }
                  total: { type: number }
`;

const candidateExample = `openapi: 3.0.3
info: { title: Orders API, version: 2.0.0 }
paths:
  /orders/{id}:
    get:
      parameters:
        - { name: id, in: path, required: true, schema: { type: string } }
        - { name: accountId, in: query, required: true, schema: { type: string } }
      responses:
        "200":
          description: An order
          content:
            application/json:
              schema:
                type: object
                properties:
                  id: { type: string }
                  status: { type: string, enum: [paid, shipped] }
`;

function parseSpec(source: string): unknown {
  const document = parse(source);
  if (!document || typeof document !== "object")
    throw new Error("The file does not contain an OpenAPI document.");
  const version = (document as Record<string, unknown>).openapi;
  if (typeof version !== "string" || !version.startsWith("3."))
    throw new Error("OpenAPI 3.x is required.");
  return document;
}

function reportMarkdown(changes: ContractChange[]) {
  const breaking = changes.filter((change) => change.severity === "breaking");
  return [
    "# API Contract Guard report",
    "",
    breaking.length
      ? `**Result: ${breaking.length} breaking change${breaking.length === 1 ? "" : "s"} found.**`
      : "**Result: No breaking changes found.**",
    "",
    ...changes.map(
      (change) =>
        `- **${change.severity.toUpperCase()}** — \`${change.location}\`: ${change.message}`,
    ),
    "",
    `_Generated ${new Date().toISOString()} by API Contract Guard_`,
  ].join("\n");
}

export function ContractChecker() {
  const [baseline, setBaseline] = useState("");
  const [candidate, setCandidate] = useState("");
  const [changes, setChanges] = useState<ContractChange[] | null>(null);
  const [error, setError] = useState("");
  const breakingCount =
    changes?.filter((change) => change.severity === "breaking").length ?? 0;

  function runCheck() {
    try {
      setError("");
      const result = compareContracts(
        parseSpec(baseline),
        parseSpec(candidate),
      );
      setChanges(result);
      trackEvent("checker_run", {
        breaking_changes: result.filter(
          (change) => change.severity === "breaking",
        ).length,
        campaign: "free_checker",
        total_changes: result.length,
      });
    } catch (reason) {
      setChanges(null);
      setError(
        reason instanceof Error
          ? reason.message
          : "The specifications could not be read.",
      );
    }
  }

  function loadExample() {
    setBaseline(baselineExample);
    setCandidate(candidateExample);
    setChanges(null);
    setError("");
  }

  async function loadFile(
    file: File | undefined,
    setter: (value: string) => void,
  ) {
    if (!file) return;
    setter(await file.text());
    setChanges(null);
  }

  function downloadReport() {
    if (!changes) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob([reportMarkdown(changes)], { type: "text/markdown" }),
    );
    link.download = "api-contract-guard-report.md";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <div className="checker-card">
      <div className="editor-grid">
        <label className="editor">
          <span>
            <b>Baseline</b>
            <small>Current production contract</small>
          </span>
          <input
            type="file"
            accept=".json,.yaml,.yml,application/json,text/yaml"
            onChange={(event) =>
              void loadFile(event.target.files?.[0], setBaseline)
            }
          />
          <textarea
            value={baseline}
            onChange={(event) => setBaseline(event.target.value)}
            placeholder="Paste your current OpenAPI JSON or YAML…"
            spellCheck={false}
          />
        </label>
        <label className="editor">
          <span>
            <b>Candidate</b>
            <small>Proposed new contract</small>
          </span>
          <input
            type="file"
            accept=".json,.yaml,.yml,application/json,text/yaml"
            onChange={(event) =>
              void loadFile(event.target.files?.[0], setCandidate)
            }
          />
          <textarea
            value={candidate}
            onChange={(event) => setCandidate(event.target.value)}
            placeholder="Paste the proposed OpenAPI JSON or YAML…"
            spellCheck={false}
          />
        </label>
      </div>
      <div className="checker-actions">
        <button
          className="button primary"
          type="button"
          onClick={runCheck}
          disabled={!baseline.trim() || !candidate.trim()}
        >
          Run contract check
        </button>
        <button className="text-button" type="button" onClick={loadExample}>
          Load a breaking-change example
        </button>
        <span>Your files never leave this device.</span>
      </div>
      {error ? (
        <div className="error" role="alert">
          <b>Could not compare these files.</b>
          <span>{error}</span>
        </div>
      ) : null}
      {changes ? (
        <section className="results" aria-live="polite">
          <div
            className={`result-summary ${breakingCount ? "failed" : "passed"}`}
          >
            <div>
              <span>{breakingCount ? "BREAKING" : "PASSED"}</span>
              <h3>
                {breakingCount
                  ? `${breakingCount} breaking change${breakingCount === 1 ? "" : "s"} found`
                  : "No breaking changes found"}
              </h3>
              <p>
                {changes.length} total contract change
                {changes.length === 1 ? "" : "s"} analysed.
              </p>
            </div>
            <button
              className="button secondary"
              type="button"
              onClick={downloadReport}
            >
              Download report
            </button>
          </div>
          <div className="change-list">
            {changes.length ? (
              changes.map((change) => (
                <article
                  className={`change ${change.severity}`}
                  key={`${change.severity}-${change.category}-${change.location}-${change.message}`}
                >
                  <span className="severity">{change.severity}</span>
                  <div>
                    <code>{change.location}</code>
                    <h4>{change.category}</h4>
                    <p>{change.message}</p>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty">
                The contracts are structurally identical for the checks
                currently supported.
              </p>
            )}
          </div>
          <div className="checker-conversion">
            <div>
              <span className="step">AUTOMATE THIS CHECK</span>
              <h3>Run the same protection on every pull request</h3>
              <p>
                Install API Contract Guard, choose up to 3 repositories, and
                start a 14-day trial without entering card details.
              </p>
            </div>
            <a
              className="button primary"
              data-track-campaign="checker_result"
              data-track-event="install_cta_clicked"
              href={installUrl}
            >
              Protect my repositories
            </a>
          </div>
        </section>
      ) : null}
    </div>
  );
}
