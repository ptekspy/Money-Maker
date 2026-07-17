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

    const landlordStripeSecretKey = new sst.Secret(
      "LandlordStripeSecretKey",
    );
    const landlordStripeWebhookSecret = new sst.Secret(
      "LandlordStripeWebhookSecret",
    );
    const landlordStripeAnnualPriceId = new sst.Secret(
      "LandlordStripeAnnualPriceId",
    );

    const landlordSaas = new sst.aws.Nextjs("LandlordSaas", {
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
        STRIPE_SECRET_KEY: landlordStripeSecretKey.value,
        STRIPE_WEBHOOK_SECRET: landlordStripeWebhookSecret.value,
        STRIPE_CERTCUE_ANNUAL_PRICE_ID: landlordStripeAnnualPriceId.value,
        EMAIL_FROM: "LetDue <reminders@letdue.com>",
      },
      domain:
        $app.stage === "production"
          ? undefined
          : {
              name: "letdue.com",
              redirects: ["www.letdue.com"],
              dns: false,
              cert: "arn:aws:acm:us-east-1:077101397910:certificate/64c3a5f9-d692-4f77-b568-b16d44304e68",
            },
    });

    return {
      landlordSaasUrl: landlordSaas.url,
      landlordDataTable: landlordData.name,
      landlordDocumentsBucket: landlordDocuments.name,
    };
  },
});
