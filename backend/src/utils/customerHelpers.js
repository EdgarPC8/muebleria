/**
 * Normalización y validación de payloads de cliente para el API.
 */
/** Arma nombre completo para listados y campo legacy `name`. */
export function buildCustomerFullName({
  firstName,
  secondName,
  firstLastName,
  secondLastName,
  name,
}) {
  const parts = [firstName, secondName, firstLastName, secondLastName]
    .map((s) => String(s ?? "").trim())
    .filter(Boolean);
  if (parts.length) return parts.join(" ");
  return String(name ?? "").trim();
}

export function normalizeCustomerPayload(body = {}) {
  const firstName = String(body.firstName ?? "").trim();
  const secondName = String(body.secondName ?? "").trim() || null;
  const firstLastName = String(body.firstLastName ?? "").trim();
  const secondLastName = String(body.secondLastName ?? "").trim() || null;
  const documentType = ["cedula", "pasaporte", "otro"].includes(body.documentType)
    ? body.documentType
    : "cedula";
  const documentNumber = String(body.documentNumber ?? body.ci ?? "").trim() || null;
  const birthDate = body.birthDate ? String(body.birthDate).slice(0, 10) : null;

  const name =
    String(body.name ?? "").trim() ||
    buildCustomerFullName({ firstName, secondName, firstLastName, secondLastName });

  const ci = documentType === "cedula" ? documentNumber : null;

  return {
    firstName,
    secondName,
    firstLastName,
    secondLastName,
    birthDate,
    documentType,
    documentNumber,
    name,
    ci,
    nickname: body.nickname?.trim() || null,
    email: body.email?.trim() || null,
    phone: body.phone || null,
    secondaryPhone: body.secondaryPhone || null,
    address: body.address || null,
    city: body.city?.trim() || null,
    reference: body.reference?.trim() || null,
    notes: body.notes?.trim() || null,
  };
}

export function validateCustomerPayload(payload, opts = {}) {
  if (opts.allowLegacy && payload.name) {
    return null;
  }
  if (!payload.firstName) {
    return "El primer nombre es obligatorio.";
  }
  if (!payload.firstLastName) {
    return "El primer apellido es obligatorio.";
  }
  if (!payload.name) {
    return "No se pudo armar el nombre del cliente.";
  }
  if (!payload.documentNumber) {
    return "El número de documento es obligatorio.";
  }
  if (payload.documentType === "cedula" && !/^\d{10}$/.test(payload.documentNumber)) {
    return "La cédula debe tener 10 dígitos.";
  }
  return null;
}
