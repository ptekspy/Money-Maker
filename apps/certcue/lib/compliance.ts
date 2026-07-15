export type CertificateKind =
  | "Gas safety"
  | "EICR"
  | "EPC"
  | "Landlord insurance"
  | "Property licence";

export type CertificateInput = {
  kind: CertificateKind;
  expiry: string;
};

export type ComplianceItem = CertificateInput & {
  daysLeft: number | null;
  status: "Overdue" | "Due soon" | "Current" | "Missing";
};

export function assessCertificate(input: CertificateInput): ComplianceItem {
  if (!input.expiry) return { ...input, daysLeft: null, status: "Missing" };
  const expiry = new Date(`${input.expiry}T12:00:00`);
  if (Number.isNaN(expiry.getTime())) {
    return { ...input, daysLeft: null, status: "Missing" };
  }
  const daysLeft = Math.ceil((expiry.getTime() - Date.now()) / 86_400_000);
  if (daysLeft < 0) return { ...input, daysLeft, status: "Overdue" };
  if (daysLeft <= 60) return { ...input, daysLeft, status: "Due soon" };
  return { ...input, daysLeft, status: "Current" };
}

export function recommendedCertificates(hasGas: boolean, isHmo: boolean) {
  const core: CertificateKind[] = ["EICR", "EPC", "Landlord insurance"];
  if (hasGas) core.unshift("Gas safety");
  if (isHmo) core.push("Property licence");
  return core;
}
