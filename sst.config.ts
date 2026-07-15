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
    const landlordData = new sst.aws.Dynamo("LetDueData", {
      fields: {
        pk: "string",
        sk: "string",
        gsi1pk: "string",
        gsi1sk: "string",
      },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
      globalIndexes: {
        LookupIndex: { hashKey: "gsi1pk", rangeKey: "gsi1sk" },
      },
    });

    const landlordDocuments = new sst.aws.Bucket("LetDueDocuments", {
      versioning: true,
      lifecycle: [
        {
          id: "archive-old-versions",
          noncurrentVersionTransitions: [
            { days: 30, storageClass: "GLACIER_IR" },
          ],
          noncurrentVersionExpiration: { days: 365 },
        },
      ],
    });

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
            const stripeSecretKey = new sst.Secret("LandlordStripeSecretKey");
            const stripeWebhookSecret = new sst.Secret(
              "LandlordStripeWebhookSecret",
            );
            const stripePriceId = new sst.Secret("LandlordStripeAnnualPriceId");
            const site = new sst.aws.Nextjs("LandlordSaas", {
              path: "apps/certcue",
              link: [landlordData, landlordDocuments],
              permissions: [
                {
                  actions: ["ses:SendEmail", "ses:SendRawEmail"],
                  resources: ["*"],
                },
              ],
              environment: {
                LETDUE_TABLE_NAME: landlordData.name,
                LETDUE_DOCUMENTS_BUCKET: landlordDocuments.name,
                NEXT_PUBLIC_CERTCUE_URL: "https://letdue.com",
                STRIPE_SECRET_KEY: stripeSecretKey.value,
                STRIPE_WEBHOOK_SECRET: stripeWebhookSecret.value,
                STRIPE_CERTCUE_ANNUAL_PRICE_ID: stripePriceId.value,
                EMAIL_FROM: "LetDue <reminders@letdue.com>",
              },
            });
            return site;
          })()
        : new sst.aws.Nextjs("LandlordSaas", {
            path: "apps/certcue",
            link: [landlordData, landlordDocuments],
            permissions: [
              {
                actions: ["ses:SendEmail", "ses:SendRawEmail"],
                resources: ["*"],
              },
            ],
            environment: {
              LETDUE_TABLE_NAME: landlordData.name,
              LETDUE_DOCUMENTS_BUCKET: landlordDocuments.name,
              NEXT_PUBLIC_CERTCUE_URL: "https://letdue.com",
              EMAIL_FROM: "LetDue <reminders@letdue.com>",
            },
            domain: {
              name: "letdue.com",
              redirects: ["www.letdue.com"],
              dns: false,
              cert: "arn:aws:acm:us-east-1:077101397910:certificate/64c3a5f9-d692-4f77-b568-b16d44304e68",
            },
          });

    new sst.aws.CronV2("LandlordDailyReminders", {
      schedule: "cron(0 8 * * ? *)",
      timezone: "Europe/London",
      retries: 2,
      function: {
        handler: "infra/reminders.handler",
        timeout: "2 minutes",
        link: [landlordData],
        permissions: [
          {
            actions: ["ses:SendEmail", "ses:SendRawEmail"],
            resources: ["*"],
          },
        ],
        environment: {
          LETDUE_TABLE_NAME: landlordData.name,
          EMAIL_FROM: "LetDue <reminders@letdue.com>",
        },
      },
    });

    return {
      quoteWinBackUrl: quoteWinBack.url,
      landlordSaasUrl: landlordSaas.url,
      landlordDataTable: landlordData.name,
      landlordDocumentsBucket: landlordDocuments.name,
    };
  },
});
