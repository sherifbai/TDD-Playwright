export function createChatMarker(prefix: string): string {
  const token = Date.now()
    .toString(36)
    .replace(/\d/g, (digit) => 'qrstuvwxyz'[Number(digit)]);

  return `${prefix} ${token}`;
}
