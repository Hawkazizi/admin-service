import { getSystemInfo } from "../services/systemInfo.service.js";

export async function fetchSystemInfo(req, res) {
  try {
    const info = await getSystemInfo();
    res.status(200).json({ success: true, data: info });
  } catch (error) {
    console.error("System Info Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch system info" });
  }
}
