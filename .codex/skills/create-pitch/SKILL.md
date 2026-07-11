---
name: create-pitch
description: Create personalised QuoteWinBack pitches for prospective clients. Use when the user invokes $create-pitch or asks to create, draft, tailor, personalise, or prepare a sales pitch, outreach message, contact-form message, email, follow-up, or proposal for a roofer/trade business prospect. The skill must gather client details before drafting when key details are missing.
---

# Create Pitch

Create a personalised QuoteWinBack pitch for a specific prospect. QuoteWinBack recovers old quotes and missed enquiries for roofing and trade businesses.

## First action

If the user has not provided enough client detail, ask for the missing details before drafting. Keep the request short and easy to answer.

Ask for:

```text
Client/company name:
Website or profile link:
Trade/niche:
Location:
Contact name, if known:
Where their enquiries likely come from:
Any visible lead-leak signal:
Preferred channel: email, website form, Facebook, WhatsApp, LinkedIn, proposal
Your name/sign-off:
```

If the user only has partial information, proceed with what is available after asking once.

## Client memory

Use repo-local client memory before and after creating a pitch.

Memory location:

```text
client-memory/<client-slug>.md
```

Create `<client-slug>` from the client/company name: lowercase, replace spaces with hyphens, remove punctuation.

Before drafting:

- Check whether a memory file exists for the client.
- If it exists, read it and use verified details to personalise the pitch.
- Do not invent facts from memory gaps.

After drafting:

- Create or update the client memory file.
- Append a dated note with:
  - client/company name
  - website/profile link
  - trade/niche
  - location
  - known contact name
  - likely enquiry sources
  - visible lead-leak signals
  - channel used
  - pitch angle used
  - date and short summary of output
- Preserve prior useful notes.
- Do not store sensitive personal data beyond business contact context supplied for outreach.

## Pitch rules

- Write in plain UK English.
- Sound local, practical, and low-pressure.
- Do not mention "AI automation agency".
- Do not guarantee revenue.
- Lead with old quotes, missed enquiries, paid lead waste, and follow-up gaps.
- Mention approval before anything is sent when relevant.
- Keep initial outreach short enough for contact forms.
- Avoid pushy, fake-personalised, or hype-heavy language.

## Default offer

Use this offer unless the user provides another:

```text
Send the last 60-90 days of unclosed enquiries. I will show the recoverable pipeline before you pay. If I do not find at least 5 warm recovery opportunities, there is no charge.
```

## Output format

Return the most useful pitch assets for the channel:

- For website forms: subject if useful, short message, and sign-off.
- For email: subject line, email body, and one follow-up.
- For Facebook/WhatsApp: short message only.
- For proposal: concise intro, problem, process, pilot offer, next step.

When details are uncertain, use placeholders like `{{first_name}}` or `{{company}}` instead of inventing facts.

## Personalisation cues

Use client-specific details only when provided or visible from supplied data:

- "free quotes" or "free quotations"
- emergency repairs
- Checkatrade, MyBuilder, Bark, Rated People, Google, Facebook
- roof repairs, flat roofing, guttering, damp patches, storm/rain damage
- high review count, sponsored listing, contact form, Facebook-only presence

## Closing question

End with one simple next step, usually:

```text
Worth a quick look?
```

or

```text
Want me to run a small recovery scan?
```
