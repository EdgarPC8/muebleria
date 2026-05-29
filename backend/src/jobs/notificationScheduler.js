/**
 * Tarea periódica: envía notificaciones programadas según cron/intervalo.
 */
import { Op } from "sequelize";
import { NotificationProgram } from "../models/NotificationProgram.js";
import { Notifications } from "../models/Notifications.js";
import { sendNotificationToUser } from "../sockets/notificationSocket.js";
import { getTargetUserIds } from "../controllers/NotificationProgramController.js";

export function startNotificationScheduler() {
  setInterval(async () => {
    try {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const timeStr = `${h}:${m}`;

      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const programs = await NotificationProgram.findAll({
        where: {
          active: true,
          scheduleType: "daily",
          scheduleTime: timeStr,
          [Op.or]: [{ lastSentAt: null }, { lastSentAt: { [Op.lt]: startOfToday } }],
        },
      });

      for (const prog of programs) {
        const userIds = await getTargetUserIds(prog.targetType, prog.targetRoleIds);
        const payload = {
          type: "info",
          title: prog.title,
          message: prog.message,
          link: prog.link || null,
        };
        for (const userId of userIds) {
          await Notifications.create({ userId, accountId: null, ...payload });
          sendNotificationToUser(userId, { ...payload, seen: false });
        }
        await prog.update({ lastSentAt: new Date() });
        console.log(`📬 Saludo programado "${prog.code}" → ${userIds.length} usuarios`);
      }
    } catch (err) {
      console.error("Error en scheduler de notificaciones:", err);
    }
  }, 60000);
}
