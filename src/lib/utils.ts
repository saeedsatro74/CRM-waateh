import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ');
}

// Convert English numbers to Persian digits
export function toPersianDigits(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '';
  const str = String(num);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (x) => persianDigits[parseInt(x)]);
}

// Format currency in Tomans with Persian digits
export function formatTomans(amount: number): string {
  if (isNaN(amount)) return '۰ تومان';
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  return `${formatted} تومان`;
}

// Format short price (e.g., 25.5 M)
export function formatCompactTomans(amount: number): string {
  if (amount >= 1_000_000_000) {
    const billion = (amount / 1_000_000_000).toFixed(1);
    return `${toPersianDigits(billion)} میلیارد تومان`;
  }
  if (amount >= 1_000_000) {
    const million = (amount / 1_000_000).toFixed(1);
    return `${toPersianDigits(million)} میلیون تومان`;
  }
  return formatTomans(amount);
}

// Format Persian Relative Date
export function formatRelativePersianDate(dateString: string): string {
  if (!dateString) return 'نامشخص';
  
  const date = new Date(dateString);
  const now = new Date();
  
  if (isNaN(date.getTime())) return dateString; // return raw if custom string
  
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'امروز';
  if (diffInDays === 1) return 'دیروز';
  if (diffInDays === -1) return 'فردا';
  if (diffInDays > 1 && diffInDays < 7) return `${toPersianDigits(diffInDays)} روز پیش`;
  if (diffInDays >= 7 && diffInDays < 30) return `${toPersianDigits(Math.floor(diffInDays / 7))} هفته پیش`;
  if (diffInDays >= 30) return `${toPersianDigits(Math.floor(diffInDays / 30))} ماه پیش`;
  
  return toPersianDigits(date.toLocaleDateString('fa-IR'));
}

// CSV Export Helper with UTF-8 BOM for Iranian Excel compatibility
export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row
        .map((cell) => {
          const str = String(cell ?? '').replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    ),
  ].join('\n');

  // Add UTF-8 BOM so Persian chars display accurately
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
