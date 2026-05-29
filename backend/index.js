import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

import { sequelize } from "./src/database/connection.js";
import { loggerMiddleware } from "./src/middlewares/loggerMiddleware.js";
import "./src/models/index.js";

import UsersRoutes from "./src/routes/UsersRoutes.js";
import AuthRoutes from "./src/routes/AuthRoutes.js";
import AccountsRoutes from "./src/routes/AccountsRoutes.js";
import NotificationsRoutes from "./src/routes/NotificationsRoutes.js";
import NotificationProgramRoutes from "./src/routes/NotificationProgramRoutes.js";
import ComandsRoutes from "./src/routes/ComandsRoutes.js";
import ImgRoutes from "./src/routes/ImgRoutes.js";
import MuebleriaRoutes from "./src/routes/MuebleriaRoutes.js";
import { initNotificationSocket } from "./src/sockets/notificationSocket.js";
import { insertDataIfEmpty } from "./src/database/insertData.js";
import { seedMuebleriaUnitsIfEmpty } from "./src/database/seedMuebleriaUnits.js";
import { seedNotificationProgramsIfEmpty } from "./src/database/seedNotificationPrograms.js";
import { startNotificationScheduler } from "./src/jobs/notificationScheduler.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const httpServer = createServer(app);
const api = "muebleriaapi";
const PORT = Number(process.env.MUEBLERIA_API_PORT || 3007);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://192.168.110.199:5173",
  "http://192.168.110.199:5174",
  "https://aplicaciones.marianosamaniego.edu.ec",
  "https://www.aplicaciones.marianosamaniego.edu.ec",
];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(express.json());
app.use(loggerMiddleware);

const corsOptions = {
  origin(origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) callback(null, true);
    else callback(new Error("Acceso no permitido por CORS"));
  },
  optionsSuccessStatus: 200,
  credentials: true,
};
app.use(cors(corsOptions));
app.use(`/${api}/img`, ImgRoutes);
app.use(`/${api}/img`, express.static(path.join(__dirname, "src", "img")));

app.set("muebleriaApiPrefix", api);

app.use(`/${api}/users`, UsersRoutes);
app.use(`/${api}`, AuthRoutes);
app.use(`/${api}`, AccountsRoutes);
app.use(`/${api}/notifications`, NotificationsRoutes);
app.use(`/${api}/notification-programs`, NotificationProgramRoutes);
app.use(`/${api}/comands`, ComandsRoutes);
app.use(`/${api}/muebleria`, MuebleriaRoutes);
app.get(`/${api}/health`, (_, res) => res.json({ ok: true, service: "muebleria" }));

initNotificationSocket(io);

async function main() {
  try {
    await sequelize.authenticate();
    console.log("✅ Conexión a MySQL (muebleria) correcta.");

    await sequelize.sync();
    console.log("✅ Modelos sincronizados.");

    await insertDataIfEmpty();
    await seedMuebleriaUnitsIfEmpty();
    await seedNotificationProgramsIfEmpty();

    startNotificationScheduler();

    httpServer.listen(PORT, () => {
      console.log(`🟢 muebleria backend + Socket.IO en http://localhost:${PORT} (prefijo /${api})`);
    });
  } catch (error) {
    console.error("❌ Error de base de datos:", error.message);
  }
}

main();
