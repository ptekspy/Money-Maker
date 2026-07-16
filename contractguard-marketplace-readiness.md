# API Contract Guard marketplace readiness

## Public URLs

- Website: https://apicontractguard.com
- App: https://app.apicontractguard.com
- GitHub App: https://github.com/apps/api-contract-guard-by-letdue
- Live proof PR: https://github.com/ptekspy/contract-guard-live-demo/pull/1/checks
- Terms: https://apicontractguard.com/terms
- Privacy: https://apicontractguard.com/privacy
- Support: https://apicontractguard.com/support
- Health: https://app.apicontractguard.com/api/system/health

## Listing copy

Short description:

Blocks breaking OpenAPI changes before merge with automated GitHub PR checks.

Long description:

API Contract Guard installs as a GitHub App and runs on pull requests. It compares OpenAPI JSON or YAML files against the base branch and reports breaking changes directly in GitHub Checks, including removed endpoints, removed responses, new required inputs, and incompatible schema changes.

## Pricing

- 14-day trial, no card required
- GBP 9 per private repository per month
- Public demo and free browser checker remain available

## Demo flow

1. Open https://github.com/ptekspy/contract-guard-live-demo/pull/1/checks
2. Select the API Contract Guard check run.
3. Show the failing output: `1 breaking API change`.
4. Show the detailed message: `GET /health -> 200 response was removed`.

## Stripe values needed for live test

- `CONTRACTGUARD_STRIPE_SECRET_KEY`
- `CONTRACTGUARD_STRIPE_WEBHOOK_SECRET`
- `CONTRACTGUARD_STRIPE_PRICE_ID`

Set the price to a recurring monthly price for GBP 9. The app already reads the price ID from a GitHub Actions variable and the secret key/webhook secret from GitHub Actions secrets.

## Stripe webhook endpoint

https://app.apicontractguard.com/api/billing/webhook

Required events:

- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Live-test checklist

1. Add the live Stripe secret key to GitHub Actions secret `CONTRACTGUARD_STRIPE_SECRET_KEY`.
2. Add the live Stripe webhook secret to GitHub Actions secret `CONTRACTGUARD_STRIPE_WEBHOOK_SECRET`.
3. Add the live Stripe price ID to GitHub Actions variable `CONTRACTGUARD_STRIPE_PRICE_ID`.
4. Redeploy AWS preview.
5. Confirm `/api/system/health` reports Stripe `secretKey`, `webhookSecret`, and `priceId` as true.
6. Use an expired or test installation to click `Activate protection`.
7. Complete Stripe Checkout.
8. Confirm Stripe webhook updates the installation to `active` in the dashboard.
