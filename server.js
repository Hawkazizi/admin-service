import express from "express";
import cors from "cors";
import systemInfoRoutes from "./routes/systemInfo.routes.js";
const PORT = 5002;

const app = express();
app.use(cors());
app.use("/api/admin", systemInfoRoutes);
app.use("/", (req, res) => res.send("<h1>hi</h1>"));

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
