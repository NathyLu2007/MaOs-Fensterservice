export const PRICE_PER_METER = 22;
export const ANFAHRT = 100;
export const REGIE_PRO_FENSTER = 13;
export const MINDERMENGENZUSCHLAG = 100;
export const MINDERMENGE_GRENZE = 100;
export const MWST_SATZ = 0.19;
export const NEUFENSTER_FAKTOR = 10;
export const HAUSTUER_FAKTOR = 14;

export const ITEM_TYPES = [
  { value: 'fenster', label: 'Fenster', icon: '🪟', defaultW: 80, defaultH: 120 },
  { value: 'haustuer', label: 'Haustür', icon: '🚪', defaultW: 100, defaultH: 210 },
  { value: 'terrassentuer', label: 'Terrassentür', icon: '🏠', defaultW: 90, defaultH: 210 },
  { value: 'balkontuer', label: 'Balkontür', icon: '🪟', defaultW: 80, defaultH: 210 },
];

export interface LineItem {
  id: string;
  type: string;
  label: string;
  widthCm: number;
  heightCm: number;
  condition: string;
  sealCount: 1 | 2 | 3;
}

export interface ItemPrice {
  item: LineItem;
  perimeterM: number;
  sealMeters: number;
  materialCost: number;
  regiestunde: number;
  itemNetto: number;
  newWindowBrutto: number;
}

export interface PriceResult {
  itemPrices: ItemPrice[];
  sumMaterialCost: number;
  sumRegiestunde: number;
  totalSealMeters: number;
  anfahrt: number;
  mindermengenZuschlag: number;
  nettoGesamt: number;
  mwst: number;
  bruttoGesamt: number;
  neufensterGesamt: number;
  ersparnis: number;
}

function conditionMultiplier(condition: string): number {
  if (condition === 'beschädigt') return 1.3;
  if (condition === 'stark_beschädigt') return 1.5;
  return 1.0;
}

export function calculatePrice(items: LineItem[]): PriceResult {
  const itemPrices: ItemPrice[] = items.map((item) => {
    const perimeterM = (item.widthCm * 2 + item.heightCm * 2) / 100;
    const sealMeters = perimeterM * item.sealCount;
    const mult = conditionMultiplier(item.condition);
    const materialCost = sealMeters * PRICE_PER_METER * mult;
    const regiestunde = REGIE_PRO_FENSTER;
    const itemNetto = materialCost + regiestunde;
    const neufaktor = item.type === 'haustuer' ? HAUSTUER_FAKTOR : NEUFENSTER_FAKTOR;
    const newWindowBrutto = itemNetto * (1 + MWST_SATZ) * neufaktor;
    return { item, perimeterM, sealMeters, materialCost, regiestunde, itemNetto, newWindowBrutto };
  });

  const totalSealMeters = itemPrices.reduce((s, i) => s + i.sealMeters, 0);
  const sumMaterialCost = itemPrices.reduce((s, i) => s + i.materialCost, 0);
  const sumRegiestunde = itemPrices.reduce((s, i) => s + i.regiestunde, 0);
  const mindermengenZuschlag = totalSealMeters < MINDERMENGE_GRENZE ? MINDERMENGENZUSCHLAG : 0;
  const anfahrt = ANFAHRT;
  const nettoGesamt = sumMaterialCost + sumRegiestunde + anfahrt + mindermengenZuschlag;
  const mwst = nettoGesamt * MWST_SATZ;
  const bruttoGesamt = nettoGesamt + mwst;
  const neufensterGesamt = itemPrices.reduce((s, i) => s + i.newWindowBrutto, 0);
  const ersparnis = neufensterGesamt - bruttoGesamt;

  return {
    itemPrices,
    sumMaterialCost,
    sumRegiestunde,
    totalSealMeters,
    anfahrt,
    mindermengenZuschlag,
    nettoGesamt,
    mwst,
    bruttoGesamt,
    neufensterGesamt,
    ersparnis,
  };
}
