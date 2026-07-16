export type Severity = "breaking" | "warning" | "safe";

export type ContractChange = {
  severity: Severity;
  category: string;
  location: string;
  message: string;
};

type JsonRecord = Record<string, unknown>;
const HTTP_METHODS = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
  "trace",
];

function record(value: unknown): JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringArray(value: unknown): string[] {
  return array(value).filter(
    (item): item is string => typeof item === "string",
  );
}

function resolveRef(document: JsonRecord, value: unknown): JsonRecord {
  const candidate = record(value);
  const ref = candidate.$ref;
  if (typeof ref !== "string" || !ref.startsWith("#/")) return candidate;
  return ref
    .slice(2)
    .split("/")
    .reduce<unknown>(
      (current, part) =>
        record(current)[part.replaceAll("~1", "/").replaceAll("~0", "~")],
      document,
    ) as JsonRecord;
}

function schemaFromMedia(document: JsonRecord, value: unknown): JsonRecord {
  const content = record(record(value).content);
  const media = record(
    content["application/json"] ?? Object.values(content)[0],
  );
  return resolveRef(document, media.schema);
}

function compareSchema(
  oldDoc: JsonRecord,
  newDoc: JsonRecord,
  oldValue: unknown,
  newValue: unknown,
  location: string,
  changes: ContractChange[],
) {
  const oldSchema = resolveRef(oldDoc, oldValue);
  const newSchema = resolveRef(newDoc, newValue);
  if (!Object.keys(oldSchema).length || !Object.keys(newSchema).length) return;

  if (
    typeof oldSchema.type === "string" &&
    typeof newSchema.type === "string" &&
    oldSchema.type !== newSchema.type
  ) {
    changes.push({
      severity: "breaking",
      category: "Schema",
      location,
      message: `Type changed from ${oldSchema.type} to ${newSchema.type}.`,
    });
  }

  const removedEnum = stringArray(oldSchema.enum).filter(
    (item) => !stringArray(newSchema.enum).includes(item),
  );
  if (removedEnum.length) {
    changes.push({
      severity: "breaking",
      category: "Schema",
      location,
      message: `Allowed values removed: ${removedEnum.join(", ")}.`,
    });
  }

  const oldProperties = record(oldSchema.properties);
  const newProperties = record(newSchema.properties);
  for (const property of Object.keys(oldProperties)) {
    if (!(property in newProperties)) {
      changes.push({
        severity: "breaking",
        category: "Response schema",
        location: `${location}.${property}`,
        message: "Property was removed.",
      });
    } else {
      compareSchema(
        oldDoc,
        newDoc,
        oldProperties[property],
        newProperties[property],
        `${location}.${property}`,
        changes,
      );
    }
  }
}

function parametersFor(
  document: JsonRecord,
  pathItem: JsonRecord,
  operation: JsonRecord,
): JsonRecord[] {
  return [...array(pathItem.parameters), ...array(operation.parameters)].map(
    (value) => resolveRef(document, value),
  );
}

export function compareContracts(
  oldDocument: unknown,
  newDocument: unknown,
): ContractChange[] {
  const oldDoc = record(oldDocument);
  const newDoc = record(newDocument);
  const oldPaths = record(oldDoc.paths);
  const newPaths = record(newDoc.paths);
  const changes: ContractChange[] = [];

  for (const [path, oldPathValue] of Object.entries(oldPaths)) {
    const oldPath = record(oldPathValue);
    if (!(path in newPaths)) {
      changes.push({
        severity: "breaking",
        category: "Endpoint",
        location: path,
        message: "Path was removed.",
      });
      continue;
    }
    const newPath = record(newPaths[path]);
    for (const method of HTTP_METHODS) {
      if (!(method in oldPath)) continue;
      if (!(method in newPath)) {
        changes.push({
          severity: "breaking",
          category: "Operation",
          location: `${method.toUpperCase()} ${path}`,
          message: "Operation was removed.",
        });
        continue;
      }
      const oldOperation = record(oldPath[method]);
      const newOperation = record(newPath[method]);
      const oldParameterKeys = new Set(
        parametersFor(oldDoc, oldPath, oldOperation).map(
          (parameter) => `${parameter.in}:${parameter.name}`,
        ),
      );
      for (const parameter of parametersFor(newDoc, newPath, newOperation)) {
        const key = `${parameter.in}:${parameter.name}`;
        if (!oldParameterKeys.has(key) && parameter.required === true) {
          changes.push({
            severity: "breaking",
            category: "Parameter",
            location: `${method.toUpperCase()} ${path}`,
            message: `New required ${String(parameter.in)} parameter “${String(parameter.name)}”.`,
          });
        }
      }

      const oldRequest = resolveRef(oldDoc, oldOperation.requestBody);
      const newRequest = resolveRef(newDoc, newOperation.requestBody);
      if (oldRequest.required !== true && newRequest.required === true) {
        changes.push({
          severity: "breaking",
          category: "Request body",
          location: `${method.toUpperCase()} ${path}`,
          message: "Request body became required.",
        });
      }

      const oldResponses = record(oldOperation.responses);
      const newResponses = record(newOperation.responses);
      for (const [status, oldResponse] of Object.entries(oldResponses)) {
        if (!(status in newResponses)) {
          changes.push({
            severity: "breaking",
            category: "Response",
            location: `${method.toUpperCase()} ${path} → ${status}`,
            message: "Response was removed.",
          });
          continue;
        }
        compareSchema(
          oldDoc,
          newDoc,
          schemaFromMedia(oldDoc, oldResponse),
          schemaFromMedia(newDoc, newResponses[status]),
          `${method.toUpperCase()} ${path} → ${status}`,
          changes,
        );
      }
    }
  }

  for (const path of Object.keys(newPaths)) {
    if (!(path in oldPaths)) {
      changes.push({
        severity: "safe",
        category: "Endpoint",
        location: path,
        message: "New path added.",
      });
    }
  }

  return changes.sort(
    (a, b) =>
      ({ breaking: 0, warning: 1, safe: 2 })[a.severity] -
      { breaking: 0, warning: 1, safe: 2 }[b.severity],
  );
}
