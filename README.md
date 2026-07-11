# QuoteWinBack

QuoteWinBack is the first pilot version of the missed-enquiry recovery product.

It is designed for Bradford and West Yorkshire trade businesses first: upload old enquiries, find the warmest follow-up opportunities, draft recovery messages, and export an approved recovery queue.

## Open the prototype

Open `index.html` in a browser. It loads sample roofing enquiry data automatically.

## CSV format

Use these columns:

```csv
name,phone,email,service,status,source,date,value,notes
```

## First pilot offer

> Give me your last 60-90 days of missed calls, form fills, Checkatrade/MyBuilder/Bark enquiries, and unclosed quotes. I will find the recoverable pipeline and help you follow up. If I do not find at least 5 warm recovery opportunities, you do not pay.

Suggested pricing:

- GBP 300 setup
- GBP 250 per month
- Optional: 5-10% of recovered booked revenue

## First customer workflow

1. Ask for a CSV export, spreadsheet, or screenshots of unclosed enquiries.
2. Upload the enquiries into the prototype.
3. Review hot and warm recovery targets.
4. Edit and approve message drafts.
5. Send approved follow-ups through the channel the client allows.
6. Track replies, booked appointments, and estimated recovered revenue.

## Sales assets

- `brand-kit.md` has the recommended name, domain, email setup, colours, and signature.
- `logo.svg` is the first working logo.
- `sales-kit.md` has the cold email, contact form copy, qualification questions, and objections.
- `outreach-sequence.md` has the Bradford roofer no-call email, contact form, follow-up, WhatsApp, and Facebook scripts.
- `pilot-checklist.md` has the end-to-end delivery checklist.
- `first-48-hours.md` has the first no-call outreach plan.
- `prospect-tracker.csv` is the first tracker for outbound targets.

## Repo skills

- `$create-pitch` asks for client details, drafts a tailored QuoteWinBack pitch, and updates `client-memory/<client>.md`.
- `$analyse-documents` asks for the client and folder path, analyses documents, updates client memory, and writes a CSV to `document-analysis/<client>-analysis.csv`.
- `$create-app-csv` creates the final app-ready upload CSV for a client and writes it to `app-uploads/<client>-lead-upload.csv`.

## First local wedge

Start in Bradford and West Yorkshire with:

- Roofers
- Damp proofing firms
- Plumbers
- Boiler repair and installation firms
- Window and door installers

## What to build next

- Save lead queues in a database.
- Add Twilio SMS sending with opt-out handling.
- Add email sending through Resend.
- Add business accounts and login.
- Add calendar booking links per business.
- Add simple outcome tracking: replied, booked, lost, do not contact.
