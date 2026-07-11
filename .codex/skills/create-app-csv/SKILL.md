---
name: create-app-csv
description: Create the exact lead upload CSV for the QuoteWinBack app for a specific client. Use when the user invokes $create-app-csv or asks to create, prepare, build, convert, or generate the app CSV/upload CSV from client memory, analysed documents, prospect notes, raw files, or previous analysis. The skill must ask for the client name and source data when missing, use client memory, and output a CSV with the app's required columns.
---

# Create App CSV

Create the exact CSV that feeds the QuoteWinBack app.

Required app columns:

```csv
name,phone,email,service,status,source,date,value,notes
```

## First action

If missing, ask:

```text
Client/company name:
Source to use: analysis CSV, folder path, raw notes, or all known client memory?
Should I include only hot/warm opportunities or every usable record?
```

If the user provides only a client name, look for:

```text
client-memory/<client-slug>.md
document-analysis/<client-slug>-analysis.csv
```

If neither exists, ask for source files, a folder path, or pasted raw data.

## Client memory

Use repo-local client memory.

Memory location:

```text
client-memory/<client-slug>.md
```

Create `<client-slug>` from the client/company name: lowercase, replace spaces with hyphens, remove punctuation.

Before creating the CSV:

- Read client memory if it exists.
- Use it to understand the client, trade, known lead sources, known terminology, and prior analysis.

After creating the CSV:

- Create or update the memory file.
- Append a dated note with:
  - source used
  - upload CSV path
  - number of rows created
  - included priority filter, if any
  - data gaps found
  - next recommended action

Do not store unnecessary sensitive personal data in memory. Summarise rather than copying customer-level rows into memory.

## Output location

Write the app-ready CSV to:

```text
app-uploads/<client-slug>-lead-upload.csv
```

Create `app-uploads/` if needed.

## Source priority

Prefer sources in this order:

1. User-provided explicit file/path for this task.
2. `document-analysis/<client-slug>-analysis.csv`.
3. Raw notes or pasted data from the current conversation.
4. Client memory for context only.

Client memory alone usually should not create customer rows unless it contains explicit, reliable row-level lead details.

## Mapping from analysis CSV

When converting from `document-analysis/<client-slug>-analysis.csv`, map:

```text
customer_or_contact -> name
service -> service
status -> status
source -> source
date -> date
value -> value
notes -> notes
```

Phone and email may be blank if not present in the analysis source.

Include useful context in `notes`, such as:

- recovery priority
- reason
- next action
- original file

Example note:

```text
Priority: hot. Reason: quote sent, no clear no. Next: draft follow-up. File: quotes-june.csv.
```

## Row rules

- Include one row per customer/enquiry/quote suitable for follow-up.
- Do not fabricate names, phone numbers, emails, dates, or values.
- Leave missing fields blank.
- Exclude rows marked `ignore` unless the user asks for every record.
- For `review` rows, include only if they have enough contact or service context to be useful.
- Keep `value` numeric only, no currency symbol.
- Use ISO dates (`YYYY-MM-DD`) when known.
- Escape CSV values correctly.

## Final response

Report:

- App CSV output path.
- Number of rows written.
- Source used.
- Any skipped rows and why.
- Whether it is ready to upload into the running app.
