// services/systemInfo.service.js
import os from "os";
import si from "systeminformation";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function parseFanSpeedRaw(raw) {
  if (!raw) return [];
  const lines = raw.split("\n");
  const fans = [];

  for (const line of lines) {
    const match = line.match(/(fan\d+):\s+(\d+)\s+RPM/i);
    if (match) {
      fans.push({
        label: match[1],
        rpm: Number(match[2]),
      });
    }
  }

  return fans;
}

async function getFanSpeed() {
  const platform = os.platform();

  if (platform === "linux") {
    try {
      const { stdout } = await execAsync("sensors");
      return parseFanSpeedRaw(stdout);
    } catch (err) {
      return [];
    }
  }

  if (platform === "win32") {
    return null;
  }

  if (platform === "darwin") {
    return null;
  }

  return null;
}

export async function getSystemInfo() {
  const [tempData, diskData, fanData, cpuLoadData, osInfo] = await Promise.all([
    si.cpuTemperature(),
    si.fsSize(),
    getFanSpeed(),
    si.currentLoad(),
    si.osInfo(),
  ]);

  return {
    hostname: os.hostname(),
    platform: os.platform(),
    architecture: os.arch(),
    uptime: os.uptime(),
    totalMemoryBytes: os.totalmem(),
    freeMemoryBytes: os.freemem(),
    totalMemory: formatBytes(os.totalmem()),
    freeMemory: formatBytes(os.freemem()),
    cpus: os.cpus().map((cpu) => cpu.model),
    loadAverage: os.loadavg(),
    networkInterfaces: os.networkInterfaces(),
    userInfo: os.userInfo(),

    cpuTemperature: tempData.main ?? null,

    disks: diskData.map((d) => ({
      fs: d.fs,
      type: d.type,
      sizeBytes: d.size,
      usedBytes: d.used,
      size: formatBytes(d.size),
      used: formatBytes(d.used),
      usePercent: d.use,
    })),

    fans: fanData, // structured array or null

    cpuLoadPercent:
      typeof cpuLoadData.currentLoad === "number"
        ? cpuLoadData.currentLoad.toFixed(2)
        : null,

    distro: {
      platform: osInfo.platform,
      distro: osInfo.distro,
      release: osInfo.release,
      codename: osInfo.codename,
      kernel: osInfo.kernel,
      arch: osInfo.arch,
    },
  };
}
