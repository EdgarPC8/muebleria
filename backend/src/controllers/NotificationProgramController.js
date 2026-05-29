/**
 * CRUD de notificaciones programadas y envío inmediato (admin/programador).
 */
import { Op } from "sequelize";
import { NotificationProgram } from "../models/NotificationProgram.js";
import { Notifications } from "../models/Notifications.js";
import { Account } from "../models/Account.js";
import { Roles } from "../models/Roles.js";
import { Users } from "../models/Users.js";
import { sendNotificationToUser } from "../sockets/notificationSocket.js";
import { entityWithMessage } from "../utils/jsonResponse.js";

async function getTargetUserIds(targetType, targetRoleIds) {
  if (targetType === "all_users") {
    const users = await Users.findAll({ attributes: ["id"] });
    return users.map((u) => u.id);
  }
  if (targetType === "by_role" && targetRoleIds?.length) {
    const accounts = await Account.findAll({
      include: [
        {
          model: Roles,
          as: "roles",
          where: { id: { [Op.in]: targetRoleIds } },
          through: { attributes: [] },
          required: true,
        },
      ],
      attributes: ["userId"],
    });
    return [...new Set(accounts.map((a) => a.userId).filter(Boolean))];
  }
  return [];
}

export const getAll = async (req, res) => {
  try {
    const list = await NotificationProgram.findAll({ order: [["createdAt", "DESC"]] });
    res.json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const create = async (req, res) => {
  try {
    const prog = await NotificationProgram.create(req.body);
    res.status(201).json(entityWithMessage(prog, "Notificación programada creada."));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const prog = await NotificationProgram.findByPk(req.params.id);
    if (!prog) return res.status(404).json({ message: "No encontrado" });
    await prog.update(req.body);
    await prog.reload();
    res.json(entityWithMessage(prog, "Notificación programada actualizada."));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const prog = await NotificationProgram.findByPk(req.params.id);
    if (!prog) return res.status(404).json({ message: "No encontrado" });
    await prog.destroy();
    res.json({ message: "Notificación programada eliminada." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendNow = async (req, res) => {
  try {
    const prog = await NotificationProgram.findByPk(req.params.id);
    if (!prog) return res.status(404).json({ message: "No encontrado" });

    const userIds = await getTargetUserIds(prog.targetType, prog.targetRoleIds);
    if (userIds.length === 0) {
      return res.status(400).json({ message: "No hay usuarios destino" });
    }

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
    res.json({ message: `Enviado a ${userIds.length} usuarios`, count: userIds.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { getTargetUserIds };
