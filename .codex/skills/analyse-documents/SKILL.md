---
name: analyse-documents
description: Analyse a folder of client documents and output a CSV summary for QuoteWinBack work. Use when the user invokes $analyse-documents or asks to analyse, review, inspect, extract, summarise, classify, or turn a folder of client documents/files into a CSV. The skill must ask for the folder path and client name when missing, update client memory, and produce a CSV output.
---

# Analyse Documents

Analyse client documents for QuoteWinBack and output a CSV file. Use this to turn messy client files, exports, notes, screenshots converted to text, spreadsheets, or document folders into structured findings.

## First action

If missing, ask for:

```text
Client/company name:
Folder path to analyse:
What should I look for? (default: old quotes, missed enquiries, follow-up gaps, lead sources, recovery opportunities)
```

If the user gives a relative folder path, resolve it relative to the workspace.

## Client memory

Use repo-local client memory before and after analysis.

Memory location:

```text
client-memory/<client-slug>.md
```

Create `<client-slug>` from the client/company name: lowercase, replace spaces with hyphens, remove punctuation.

Before analysis:

- Read the memory file if it exists.
- Use it to understand the client, trade, lead sources, prior pitch angle, and known context.

After analysis:

- Create or update the memory file.
- Append a dated note with:
  - analysed folder path
  - file types reviewed
  - key findings
  - lead sources found
  - strongest recovery opportunities
  - missing information
  - CSV output path
- Preserve prior useful notes.
- Do not store unnecessary sensitive personal data. Summarise customer-level details instead of copying full private records into memory.

## Supported inputs

Prefer direct parsing for:

- `.csv`
- `.tsv`
- `.txt`
- `.md`
- `.json`
- `.html`

For `.xlsx`, `.docx`, `.pdf`, image files, or other formats, use available workspace tools/libraries if present. If extraction is not available, include the file in the CSV with status `needs_manual_review`.

## CSV output

Write the CSV to:

```text
document-analysis/<client-slug>-analysis.csv
```

Create `document-analysis/` if needed.

Use these columns:

```csv
client,file,path,file_type,record_type,customer_or_contact,service,status,source,date,value,recovery_priority,reason,next_action,notes
```

Rows may represent individual leads, quotes, enquiries, files, or findings. Use one row per useful finding.

## Recovery priority

Use:

- `hot` for recent, high-value, quote-sent, urgent repair, or no-clear-no opportunities.
- `warm` for plausible stale enquiries or old quotes with some usable contact/context.
- `review` for incomplete, unclear, duplicate, or unsupported items.
- `ignore` for clearly booked, lost, spam, irrelevant, or no recovery value.

## Analysis rules

- Do not fabricate customer names, dates, values, or statuses.
- Use blanks when data is missing.
- Preserve exact filenames and paths.
- Keep notes concise.
- Highlight missing data that blocks follow-up.
- Prefer practical next actions: "draft follow-up", "request phone/email", "confirm quote status", "manual review", "ignore".

## Final response

Report:

- CSV output path.
- Number of files reviewed.
- Number of rows written.
- Count by priority.
- Top 3 recovery opportunities.
- Any files that need manual review.
