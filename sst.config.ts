/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    const production = input.stage === "production";

    return {
      name: "money-maker",
      home: "aws",
      protect: production,
      removal: production ? "retain" : "remove",
      providers: {
        aws: {
          region: "eu-west-2",
        },
      },
    };
  },

  async run() {
    const quoteWinBack = new sst.aws.StaticSite("QuoteWinBack", {
      path: "apps/web",
      build: {
        command: "npm run build",
        output: "out",
      },
    });

    const landlordSaas =
      $app.stage === "production"
        ? (() => {
            const databaseUrl = new sst.Secret("LandlordDatabaseUrl");
            const publicUrl = new sst.Secret("LandlordPublicUrl");
            const stripeSecretKey = new sst.Secret("LandlordStripeSecretKey");
            const stripeWebhookSecret = new sst.Secret("LandlordStripeWebhookSecret");
            const stripePriceId = new sst.Secret("LandlordStripeAnnualPriceId");
            const smtpHost = new sst.Secret("LandlordSmtpHost");
            const smtpUser = new sst.Secret("LandlordSmtpUser");
            const smtpPassword = new sst.Secret("LandlordSmtpPassword");
            const emailFrom = new sst.Secret("LandlordEmailFrom");
            const cronSecret = new sst.Secret("LandlordCronSecret");
            const setupSecret = new sst.Secret("LandlordSetupSecret");

            const site = new sst.aws.Nextjs("LandlordSaas", {
              path: "apps/certcue",
              environment: {
                CERTCUE_DATABASE_URL: databaseUrl.value,
                NEXT_PUBLIC_CERTCUE_URL: publicUrl.value,
                STRIPE_SECRET_KEY: stripeSecretKey.value,
                STRIPE_WEBHOOK_SECRET: stripeWebhookSecret.value,
                STRIPE_CERTCUE_ANNUAL_PRICE_ID: stripePriceId.value,
                SMTP_HOST: smtpHost.value,
                SMTP_PORT: "587",
                SMTP_USER: smtpUser.value,
                SMTP_PASSWORD: smtpPassword.value,
                EMAIL_FROM: emailFrom.value,
                CRON_SECRET: cronSecret.value,
                SETUP_SECRET: setupSecret.value,
              },
            });

            new sst.aws.CronV2("LandlordDailyReminders", {
              schedule: "cron(0 8 * * ? *)",
              timezone: "Europe/London",
              retries: 2,
              function: {
                handler: "infra/reminders.handler",
                timeout: "2 minutes",
                environment: {
                  LANDLORD_SAAS_URL: site.url,
                  CRON_SECRET: cronSecret.value,
                },
              },
            });

            return site;
          })()
        : new sst.aws.Nextjs("LandlordSaas", {
            path: "apps/certcue",
          });

    return {
      quoteWinBackUrl: quoteWinBack.url,
      landlordSaasUrl: landlordSaas.url,
    };
  },
});
