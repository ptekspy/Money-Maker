# LetDue deploy handoff

## Current status

The latest LetDue acquisition/funnel changes build locally, but are not confirmed deployed to production.

GitHub is the better deploy path now: the repository secret `AWS_DEPLOY_ROLE_ARN` exists, so the manual workflow can assume the AWS deploy role once the workflow and LetDue changes are pushed.

Recent deploy attempt:

```text
npm.cmd run deploy:aws -- --stage dellpatri
```

Result after granting deployment/network permission:

```text
AWS credentials are not configured.
```

Browser AWS sign-in is not enough for SST. SST needs local AWS credentials, an AWS profile, or an AWS provider profile configured in `sst.config.ts`.

## Changes waiting to go live

- Public contact form.
- In-app signed-in support form with account/install context.
- Certificate-renewal-reminders guide.
- Certificate-tracking spreadsheet alternative guide.
- Certificate-aftercare partner landing page.
- Founding-plan paid conversion page.
- Updated homepage/footer/sitemap links.
- Updated warm reply pack for scheduled follow-ups.

## Fastest deploy path

1. Configure local AWS credentials for the account that owns `letdue.com`.
2. Confirm the active identity:

   ```text
   aws sts get-caller-identity
   ```

3. Deploy from `C:\Users\patri\Documents\v2`:

   ```text
   npm.cmd run deploy:aws -- --stage dellpatri
   ```

4. Verify these public URLs:

   ```text
   https://letdue.com/founding-plan
   https://letdue.com/partners/certificate-aftercare
   https://letdue.com/guides/landlord-certificate-renewal-reminders
   https://letdue.com/guides/landlord-certificate-tracking-spreadsheet-alternative
   https://letdue.com/sitemap.xml
   ```

## Existing GitHub option

`.github/workflows/deploy-aws-preview.yml` can deploy a `preview` stage when pushed to `codex/aws-previews`, but it requires the GitHub secret `AWS_DEPLOY_ROLE_ARN`.

Do not assume this deploys production.

## New manual GitHub deploy option

`.github/workflows/deploy-letdue-manual.yml` adds a safer manual deploy path for LetDue. It can be run from GitHub Actions with:

- `stage`: `dellpatri`
- `confirm_domain`: `letdue.com`

It installs dependencies, checks the LetDue web app, assumes `secrets.AWS_DEPLOY_ROLE_ARN`, and runs:

```text
npm run deploy:aws -- --stage dellpatri
```

Confirmed on 2026-07-29: `AWS_DEPLOY_ROLE_ARN` exists in `ptekspy/Money-Maker`.

Remaining steps:

1. Commit and push the LetDue acquisition/funnel changes plus `.github/workflows/deploy-letdue-manual.yml`.
2. In GitHub Actions, run **Deploy LetDue manually** with:

   ```text
   stage=dellpatri
   confirm_domain=letdue.com
   ```

3. Verify the public URLs listed above.
