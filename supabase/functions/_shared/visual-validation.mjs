export const VIS_TYPES = [
  'flow', 'organizer', 'sort', 'cards', 'chat', 'news', 'timeline', 'routine', 'bars', 'pie', 'budget',
  'pizza', 'balance', 'numberline', 'areagrid', 'cubes', 'coord', 'dice', 'zoom', 'solar', 'circuit', 'heat', 'light', 'force',
  'atom', 'lever', 'shapes',
];

// Model çıktısı yalnızca izin listesindeki tam tür adlarından biri olmalıdır.
export function normalizeVisualType(value) {
  if (typeof value !== 'string') return '';
  const candidate = value.trim().toLowerCase();
  return VIS_TYPES.includes(candidate) ? candidate : '';
}
