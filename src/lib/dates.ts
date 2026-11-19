const months = ['януари','февруари','март','април','май','юни','юли','август','септември','октомври','ноември','декември'];

export const formatBg = (d: Date) => `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()} г.`;
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);
