import { EtapaVida } from '../types';

export function calcEtapaVida(edad: number): EtapaVida {
  if (edad <= 2) return '0-2';
  if (edad <= 5) return '3-5';
  if (edad <= 12) return '6-12';
  if (edad <= 17) return '13-17';
  if (edad <= 21) return '18-21';
  if (edad <= 30) return '22-30';
  if (edad <= 40) return '31-40';
  if (edad <= 50) return '41-50';
  if (edad <= 60) return '51-60';
  return '60+';
}

export const ETAPA_VIDA_LABELS: Record<EtapaVida, { es: string; en: string }> = {
  '0-2': { es: '0 – 2 años (Intervención Temprana)', en: '0 – 2 years (Early Intervention)' },
  '3-5': { es: '3 – 5 años (Preescolar)', en: '3 – 5 years (Preschool)' },
  '6-12': { es: '6 – 12 años (Edad Escolar)', en: '6 – 12 years (School Age)' },
  '13-17': { es: '13 – 17 años (Adolescencia)', en: '13 – 17 years (Adolescence)' },
  '18-21': { es: '18 – 21 años (Transición a la Vida Adulta)', en: '18 – 21 years (Transition to Adulthood)' },
  '22-30': { es: '22 – 30 años', en: '22 – 30 years' },
  '31-40': { es: '31 – 40 años', en: '31 – 40 years' },
  '41-50': { es: '41 – 50 años', en: '41 – 50 years' },
  '51-60': { es: '51 – 60 años', en: '51 – 60 years' },
  '60+': { es: 'Más de 60 años', en: 'Over 60 years' },
};

export function isAdult(edad: number): boolean {
  return edad >= 18;
}

export function generateNumeroRegistro(existing: string[]): string {
  const year = new Date().getFullYear();
  let n = existing.length + 1;
  let candidate = `TEA-${year}-${String(n).padStart(4, '0')}`;
  const set = new Set(existing);
  while (set.has(candidate)) {
    n += 1;
    candidate = `TEA-${year}-${String(n).padStart(4, '0')}`;
  }
  return candidate;
}

export function generateId(): string {
  return `rec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function daysSince(dateIso: string): number {
  const then = new Date(dateIso).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export function formatDate(dateIso: string, lang: 'es' | 'en' = 'es'): string {
  if (!dateIso) return '—';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(lang === 'es' ? 'es-PR' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
