export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) {
    return `₹ ${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `₹ ${(amount / 100000).toFixed(2)} Lakh`;
  }
  return formatINR(amount);
}

export function maskPan(pan: string, reveal = false): string {
  if (reveal) return pan;
  if (!pan || pan.length < 5) return '*****';
  return pan.slice(0, 2) + '******' + pan.slice(-2);
}

export function maskBankAccount(acc: string, reveal = false): string {
  if (reveal) return acc;
  if (!acc || acc.length < 4) return '****';
  return '******' + acc.slice(-4);
}

export function maskPhone(phone: string, reveal = false): string {
  if (reveal) return phone;
  if (!phone || phone.length < 6) return '*****';
  return phone.slice(0, 4) + ' **** ' + phone.slice(-2);
}

export function formatTimestamp(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  } catch {
    return isoStr;
  }
}
