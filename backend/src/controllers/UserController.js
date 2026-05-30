/**
 * CRUD de usuarios del sistema (tabla users).
 */
import { Account, AccountRoles } from "../models/Account.js";
import { Users } from "../models/Users.js";
import { UniqueConstraintError, where } from "sequelize";
import bcrypt from "bcrypt";
import { Roles } from "../models/Roles.js";

export const addUser = async (req, res) => {
  try {
    const { photo, ...data } = req.body;

    const newUser = await Users.create({
      ci: data.ci,
      email: data.email,
      firstName: data.firstName,
      firstLastName: data.firstLastName,
    });

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const newAccount = await Account.create({
      username: data.username,
      password: hashedPassword,
      userId: newUser.id,
    });

    const roles = data.roles.map((v) => ({
      accountId: newAccount.id,
      roleId: v,
    }));

    await AccountRoles.bulkCreate(roles);

    return res.json({
      message: "Agregado con éxito",
      user: newUser,
      success: true,
    });
  } catch (error) {
    if (
      error instanceof UniqueConstraintError ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      return res.status(400).json({
        message: "Esa cédula ya existe",
      });
    }
    console.error("error al crear el usuario:", error);
    return res.status(500).json({
      message: "Error al crear el usuario",
      error: error.message,
    });
  }
};

export const updateUserData = async (req, res) => {
  try {
    const { photo, ...data } = req.body;

    const userData = {
      ci: data.ci,
      email: data.email,
      firstName: data.firstName,
      firstLastName: data.firstLastName,
    };

    const acocuntData = {
      username: data.username,
    };

    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      acocuntData.password = hashedPassword;
    }

    await Users.update(userData, {
      where: { id: req.params.userId },
    });
    await Account.update(acocuntData, { where: { userId: req.params.userId } });

    const account = await Account.findOne({
      where: { userId: req.params.userId },
    });
    await AccountRoles.destroy({
      where: {
        accountId: account.id,
      },
    });

    const mapped = data.roles.map((roleId) => ({
      roleId,
      accountId: account.id,
    }));

    await AccountRoles.bulkCreate(mapped);

    return res.json({ message: "usuario editado con éxito" });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await Users.findAll({
      include: [
        {
          model: Account,
          as: "account",
          attributes: ["id", "username"],
          required: false,
          include: {
            model: Roles,
            as: "roles",
            attributes: ["id"],
            through: { attributes: [] },
          },
        },
      ],
    });

    const filter = users.filter((u) => u.id !== req.user.userId);

    if (!filter || filter.length === 0) {
      return res.status(404).json({ message: "No se encontraron usuarios." });
    }

    res.json(filter);
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    res.status(500).json({ message: "Error en el servidor." });
  }
};

export const getOneUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await Users.findOne({
      where: { id: userId },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await Users.destroy({
      where: {
        id: req.params.userId,
      },
    });

    res.json({ message: "Usuario eleminado con éxito" });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const addUsersBulk = async (req, res) => {
  let usuarios = req.body;

  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    return res.status(400).json({ message: "No hay usuarios para registrar" });
  }
  usuarios = usuarios.map(({ id, ...rest }) => rest);
  try {
    const resultado = await Users.bulkCreate(usuarios, {
      ignoreDuplicates: true,
      returning: true,
    });

    res.json({
      insertados: resultado.length,
      detalles: resultado,
    });
  } catch (error) {
    console.error("Error al insertar usuarios:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
