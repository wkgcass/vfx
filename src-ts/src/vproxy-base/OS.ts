let _platform: string | null = null;

async function loadPlatform(): Promise<string> {
  if (_platform !== null) return _platform;
  try {
    const mod = await import('@tauri-apps/plugin-os');
    _platform = (await mod.platform()) as string;
  } catch {
    // Fallback to navigator when not running under Tauri.
    const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
    if (ua.includes('Win')) _platform = 'windows';
    else if (ua.includes('Mac')) _platform = 'macos';
    else if (ua.includes('Linux')) _platform = 'linux';
    else _platform = 'unknown';
  }
  return _platform;
}

export async function osReady(): Promise<void> {
  await loadPlatform();
}

export function platformSync(): string {
  if (_platform !== null) return _platform;
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  if (ua.includes('Win')) return 'windows';
  if (ua.includes('Mac')) return 'macos';
  if (ua.includes('Linux')) return 'linux';
  return 'unknown';
}

export class OS {
  static async isWindows(): Promise<boolean> {
    return (await loadPlatform()) === 'windows';
  }
  static async isMac(): Promise<boolean> {
    return (await loadPlatform()) === 'macos';
  }
  static async isLinux(): Promise<boolean> {
    return (await loadPlatform()) === 'linux';
  }
  static isWindowsSync(): boolean {
    return platformSync() === 'windows';
  }
  static isMacSync(): boolean {
    return platformSync() === 'macos';
  }
  static isLinuxSync(): boolean {
    return platformSync() === 'linux';
  }
}

export default OS;
