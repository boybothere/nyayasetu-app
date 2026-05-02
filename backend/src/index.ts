import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import ingestRouter from "./routers/ingest";
import agentsRouter from "./routers/agents";
import verifyRouter from "./routers/verify";
import dashboardRouter from "./routers/dashboard";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/ingest", ingestRouter);
app.use("/api/agents", agentsRouter);
app.use("/api/verify", verifyRouter);
app.use("/api/dashboard", dashboardRouter);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`NyayaSetu backend running on port ${PORT}`);
});