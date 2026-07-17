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

    const contractGuardData = new sst.aws.Dynamo("ContractGuardData", {
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
      ttl: "expiresAt",
    });

    const contractGuardChecks = new sst.aws.Queue("ContractGuardChecks", {
      visibilityTimeout: "5 minutes",
    });

    contractGuardChecks.subscribe(
      {
        handler: "infra/contractguard-check.handler",
        timeout: "2 minutes",
        link: [contractGuardData],
        environment: {
          CONTRACTGUARD_TABLE_NAME: contractGuardData.name,
          CONTRACTGUARD_GITHUB_APP_ID:
            process.env.CONTRACTGUARD_GITHUB_APP_ID ?? "",
          CONTRACTGUARD_GITHUB_PRIVATE_KEY:
            process.env.CONTRACTGUARD_GITHUB_PRIVATE_KEY ?? "",
          CONTRACTGUARD_APP_URL: process.env.CONTRACTGUARD_APP_URL ?? "",
        },
      },
      { batch: { size: 5, partialResponses: true } },
    );

    const contractGuardApp = new sst.aws.Nextjs("ContractGuardApp", {
      path: "apps/contractguard-app",
      link: [contractGuardData, contractGuardChecks],
      permissions: [
        {
          actions: ["ses:SendEmail", "ses:SendRawEmail"],
          resources: ["*"],
        },
      ],
      domain: {
        name: "app.apicontractguard.com",
        dns: false,
        cert: "arn:aws:acm:us-east-1:077101397910:certificate/0abacd95-112a-4630-8165-9e92e4024b24",
      },
      environment: {
        CONTRACTGUARD_TABLE_NAME: contractGuardData.name,
        CONTRACTGUARD_QUEUE_URL: contractGuardChecks.url,
        CONTRACTGUARD_GITHUB_APP_ID:
          process.env.CONTRACTGUARD_GITHUB_APP_ID ?? "",
        CONTRACTGUARD_GITHUB_CLIENT_ID:
          process.env.CONTRACTGUARD_GITHUB_CLIENT_ID ?? "",
        CONTRACTGUARD_GITHUB_CLIENT_SECRET:
          process.env.CONTRACTGUARD_GITHUB_CLIENT_SECRET ?? "",
        CONTRACTGUARD_GITHUB_PRIVATE_KEY:
          process.env.CONTRACTGUARD_GITHUB_PRIVATE_KEY ?? "",
        CONTRACTGUARD_GITHUB_WEBHOOK_SECRET:
          process.env.CONTRACTGUARD_GITHUB_WEBHOOK_SECRET ?? "",
        CONTRACTGUARD_GITHUB_APP_SLUG:
          process.env.CONTRACTGUARD_GITHUB_APP_SLUG ?? "api-contract-guard",
        CONTRACTGUARD_SESSION_SECRET:
          process.env.CONTRACTGUARD_SESSION_SECRET ??
          "preview-development-only",
        CONTRACTGUARD_APP_URL:
          process.env.CONTRACTGUARD_APP_URL ??
          "https://app.apicontractguard.com",
        CONTRACTGUARD_ADMIN_LOGINS:
          process.env.CONTRACTGUARD_ADMIN_LOGINS ?? "ptekspy",
        STRIPE_SECRET_KEY: process.env.CONTRACTGUARD_STRIPE_SECRET_KEY ?? "",
        STRIPE_WEBHOOK_SECRET:
          process.env.CONTRACTGUARD_STRIPE_WEBHOOK_SECRET ?? "",
        STRIPE_CONTRACTGUARD_STARTER_PRICE_ID:
          process.env.CONTRACTGUARD_STRIPE_STARTER_PRICE_ID ?? "",
        STRIPE_CONTRACTGUARD_PRO_PRICE_ID:
          process.env.CONTRACTGUARD_STRIPE_PRO_PRICE_ID ?? "",
        CONTRACTGUARD_EMAIL_FROM:
          process.env.CONTRACTGUARD_EMAIL_FROM ??
          "API Contract Guard <admin@apicontractguard.com>",
      },
    });

    new sst.aws.CronV2("ContractGuardLifecycle", {
      schedule: "cron(0 9 * * ? *)",
      timezone: "Europe/London",
      retries: 2,
      function: {
        handler: "infra/contractguard-lifecycle.daily",
        timeout: "2 minutes",
        link: [contractGuardData],
        permissions: [
          {
            actions: ["ses:SendEmail", "ses:SendRawEmail"],
            resources: ["*"],
          },
        ],
        environment: {
          CONTRACTGUARD_TABLE_NAME: contractGuardData.name,
          CONTRACTGUARD_EMAIL_FROM:
            process.env.CONTRACTGUARD_EMAIL_FROM ??
            "API Contract Guard <admin@apicontractguard.com>",
        },
      },
    });

    new sst.aws.CronV2("ContractGuardWeeklyReport", {
      schedule: "cron(0 8 ? * MON *)",
      timezone: "Europe/London",
      retries: 2,
      function: {
        handler: "infra/contractguard-lifecycle.weekly",
        timeout: "2 minutes",
        link: [contractGuardData],
        permissions: [
          {
            actions: ["ses:SendEmail", "ses:SendRawEmail"],
            resources: ["*"],
          },
        ],
        environment: {
          CONTRACTGUARD_TABLE_NAME: contractGuardData.name,
          CONTRACTGUARD_EMAIL_FROM:
            process.env.CONTRACTGUARD_EMAIL_FROM ??
            "API Contract Guard <admin@apicontractguard.com>",
          CONTRACTGUARD_REPORT_EMAIL:
            process.env.CONTRACTGUARD_REPORT_EMAIL ??
            "admin@apicontractguard.com",
        },
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
      contractGuardUrl: contractGuard.url,
      contractGuardAppUrl: contractGuardApp.url,
      contractGuardDataTable: contractGuardData.name,
      landlordSaasUrl: landlordSaas.url,
      landlordDataTable: landlordData.name,
      landlordDocumentsBucket: landlordDocuments.name,
    };
  },
});
