function domainToken(): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:.TZ]/g, '')
    .slice(0, 14);
  const random = Math.random()
    .toString(36)
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 6);

  return `${stamp}${random}`;
}

export function createDomainName(prefix = 'autotestdomain'): string {
  return `${prefix}${domainToken()}`;
}

export function createUpdatedDomainName(baseName: string): string {
  return `${baseName}updated`;
}

export function createDomainUrl(domainName: string): string {
  return `https://${domainName.toLowerCase()}.buerokratt.ee`;
}
