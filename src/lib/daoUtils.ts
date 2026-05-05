export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function getDaoTamDescription(value: number): string {
  const clampedValue = clamp(value, 0, 100);
  
  if (clampedValue === 0) return "vỡ nát (mất bản ngã)";
  if (clampedValue < 50) return "dao động mạnh";
  if (clampedValue < 80) return "dao động nhưng ổn định";
  if (clampedValue < 100) return "kiên cố, khó lay";
  return "đạo tâm = bản thân";
}
