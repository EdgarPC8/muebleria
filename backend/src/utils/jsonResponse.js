/**
 * Respuestas JSON con campo `message` para que el frontend muestre toasts
 * sin textos fijos en la UI.
 */

/** Combina el JSON de un modelo Sequelize (o objeto) con un mensaje legible. */
export function entityWithMessage(entity, message) {
  const base = entity?.toJSON ? entity.toJSON() : { ...(entity || {}) };
  return { ...base, message };
}

/** Respuesta solo con mensaje (p. ej. eliminar, guardar backup). */
export function messageOnly(message, extra = {}) {
  return { message, ...extra };
}
