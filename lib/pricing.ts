export const PRICE_PER_WINDOW = 300;
export const PRICE_PER_METER = 22;
export const TRAVEL_FEE = 50;

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
}

export interface PriceResult {
  items: { item: LineItem; price: number; perimeter: number }[];
  subtotal: number;
  travelFee: number;
  total: number;
  totalMin: number;
  totalMax: number;
}

function conditionMultiplier(condition: string): number {
  if (condition === 'beschädigt') return 1.3;
  if (condition === 'stark_beschädigt') return 1.5;
  return 1.0;
}

export function calculatePrice(items: LineItem[]): PriceResult {
  const itemPrices = items.map((item) => {
    const perimeterM = (item.widthCm * 2 + item.heightCm * 2) / 100;
    const multiplier = conditionMultiplier(item.condition);
    const price = (PRICE_PER_WINDOW + perimeterM * PRICE_PER_METER) * multiplier;
    return { item, price, perimeter: Math.round(perimeterM * 10) / 10 };
  });

  const subtotal = itemPrices.reduce((sum, i) => sum + i.price, 0);
  const travelFee = items.length <= 2 ? TRAVEL_FEE : 0;
  const total = subtotal + travelFee;

  return {
    items: itemPrices,
    subtotal,
    travelFee,
    total,
    totalMin: Math.round(total * 0.9),
    totalMax: Math.round(total * 1.1),
  };
}
