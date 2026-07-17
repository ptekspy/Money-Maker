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
    });

    const quoteWinBack = new sst.aws.StaticSite("QuoteWinBack", {
      path: "apps/web",
      build: {
        command: "npm run build",
        output: "out",
      },
    });

    const contractGuard = new sst.aws.StaticSite("ContractGuard", {
      path: "apps/contractguard",
      build: {
        command: "npm run build",
        output: "out",
      },
      domain: {
        name: "apicontractguard.com",
        redirects: ["www.apicontractguard.com"],
        dns: false,
        cert: "arn:aws:acm:us-east-1:077101397910:certificate/64d719d7-304c-4356-af31-eea11a30e4ee",
      },
    });

    const landlordStripeSecretKey = new sst.Secret(
      "LandlordStripeSecretKey",
    );
    const landlordStripeWebhookSecret = new sst.Secret(
      "LandlordStripeWebhookSecret",
    );
    const landlordStripeAnnualPriceId = new sst.Secret(
      "LandlordStripeAnnualPriceId",
    );
    const landlordStripeEnvironment = {
      STRIPE_SECRET_KEY: landlordStripeSecretKey.value,
      STRIPE_WEBHOOK_SECRET: landlordStripeWebhookSecret.value,
      STRIPE_CERTCUE_ANNUAL_PRICE_ID: landlordStripeAnnualPriceId.value,
    };

    const landlordSaas =
      $app.stage === "production"
        ? (() => {
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
                ...landlordStripeEnvironment,
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
              ...landlordStripeEnvironment,
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
          NEXT_PUBLIC_CERTCUE_URL: "https://letdue.com",
        },
      },
    });

    return {
      quoteWinBackUrl: quoteWinBack.url,
      contractGuardUrl: contractGuard.url,
      landlordSaasUrl: landlordSaas.url,
      landlordDataTable: landlordData.name,
      landlordDocumentsBucket: landlordDocuments.name,
    };
  },
});
