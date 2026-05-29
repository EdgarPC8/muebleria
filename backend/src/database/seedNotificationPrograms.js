import { NotificationProgram } from "../models/NotificationProgram.js";

const DEFAULT_PROGRAMS = [
  {
    code: "BUENOS_DIAS",
    title: "Buenos días",
    message: "¡Que tengas un excelente día en Comercial Calva Cueva!",
    scheduleType: "daily",
    scheduleTime: "08:00",
    scopeType: "user",
    targetType: "all_users",
    active: false,
  },
  {
    code: "BUENAS_TARDES",
    title: "Buenas tardes",
    message: "¡Que tengas una excelente tarde!",
    scheduleType: "daily",
    scheduleTime: "14:00",
    scopeType: "user",
    targetType: "all_users",
    active: false,
  },
  {
    code: "BIENVENIDA",
    title: "Bienvenida",
    message: "¡Bienvenido al sistema! Esperamos que tengas una excelente experiencia.",
    scheduleType: "manual",
    scopeType: "user",
    targetType: "all_users",
    active: true,
  },
  {
    code: "ACTUALIZACION",
    title: "Actualización del sistema",
    message: "Se realizaron mejoras en el sistema. ¡Explora las nuevas funcionalidades!",
    scheduleType: "manual",
    scopeType: "user",
    targetType: "all_users",
    active: true,
  },
];

export async function seedNotificationProgramsIfEmpty() {
  const count = await NotificationProgram.count();
  if (count > 0) return;
  await NotificationProgram.bulkCreate(DEFAULT_PROGRAMS);
  console.log("✅ Plantillas de notificaciones programadas creadas (saludos, bienvenida, etc.).");
}
