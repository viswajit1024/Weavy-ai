// SSRF protection: validate image/video URLs against private networks.
// Prevents server-side requests to internal infrastructure.

const PRIVATE_IP_PATTERNS = [
  // IPv4 private ranges
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  // Loopback
  /^127\./,
  /^0\./,
  // Link-local
  /^169\.254\./,
  // IPv6 loopback/private
  /^::1$/,
  /^fc/i,
  /^fd/i,
  /^fe80/i,
];

const BLOCKED_HOSTNAMES = [
  'localhost',
  'metadata.google.internal',
  'metadata',
  'instance-data',
  '169.254.169.254', // Cloud metadata
  '100.100.100.200', // Alibaba metadata
  '[::1]',
];

/**
 * Check if a URL is safe to fetch from the server side.
 * Blocks requests to private/internal networks, loopback, and cloud metadata endpoints.
 */
export function isUrlSafe(urlString: string): { safe: boolean; reason?: string } {
  try {
    const url = new URL(urlString);

    // Only allow http/https
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { safe: false, reason: `Blocked protocol: ${url.protocol}` };
    }

    const hostname = url.hostname.toLowerCase();

    // Block known dangerous hostnames
    if (BLOCKED_HOSTNAMES.includes(hostname)) {
      return { safe: false, reason: `Blocked hostname: ${hostname}` };
    }

    // Check if hostname is an IP and if it's private
    if (isPrivateIp(hostname)) {
      return { safe: false, reason: `Blocked private IP: ${hostname}` };
    }

    // Block URLs with credentials
    if (url.username || url.password) {
      return { safe: false, reason: 'URLs with credentials are not allowed' };
    }

    // Block non-standard ports commonly used for internal services
    if (url.port) {
      const port = parseInt(url.port, 10);
      const blockedPorts = [22, 25, 53, 3306, 5432, 6379, 27017, 9200, 11211];
      if (blockedPorts.includes(port)) {
        return { safe: false, reason: `Blocked port: ${port}` };
      }
    }

    return { safe: true };
  } catch {
    return { safe: false, reason: 'Invalid URL' };
  }
}

function isPrivateIp(hostname: string): boolean {
  // Strip brackets from IPv6
  const cleaned = hostname.replace(/^\[|\]$/g, '');

  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(cleaned)) return true;
  }

  return false;
}

/**
 * Validate and sanitize an image URL.
 * Returns the URL if safe, throws if not.
 */
export function validateImageUrl(url: string, maxSizeMb: number = 10): string {
  if (!url || typeof url !== 'string') {
    throw new Error('Image URL is required');
  }

  // Data URLs are okay (base64 inline images)
  if (url.startsWith('data:image/')) {
    // Check base64 size roughly
    const base64Part = url.split(',')[1];
    if (base64Part) {
      const sizeBytes = Math.ceil(base64Part.length * 0.75);
      if (sizeBytes > maxSizeMb * 1024 * 1024) {
        throw new Error(`Image data exceeds ${maxSizeMb}MB limit`);
      }
    }
    return url;
  }

  // Relative URLs (local uploads) are okay
  if (url.startsWith('/uploads/')) {
    return url;
  }

  // Check URL safety
  const check = isUrlSafe(url);
  if (!check.safe) {
    throw new Error(`Unsafe image URL: ${check.reason}`);
  }

  return url;
}

/**
 * Validate a video URL with the same SSRF protections.
 */
export function validateVideoUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    throw new Error('Video URL is required');
  }

  if (url.startsWith('/uploads/')) {
    return url;
  }

  const check = isUrlSafe(url);
  if (!check.safe) {
    throw new Error(`Unsafe video URL: ${check.reason}`);
  }

  return url;
}
