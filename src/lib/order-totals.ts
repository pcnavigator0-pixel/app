export type OrderTotalItem = {
  price?: number | string | null;
  quantity?: number | string | null;
};

export function toMoney(value: unknown) {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue)) return 0;

  return Math.round(numericValue * 100) / 100;
}

export function getLineSubtotal(item: OrderTotalItem) {
  return toMoney(Number(item.price || 0) * Number(item.quantity || 0));
}

export function getProductsSubtotal(items: OrderTotalItem[]) {
  return toMoney(items.reduce((sum, item) => sum + getLineSubtotal(item), 0));
}

export function getOrderTotals(items: OrderTotalItem[], deliveryFee?: number | string | null) {
  const productsSubtotal = getProductsSubtotal(items);
  const normalizedDeliveryFee = toMoney(deliveryFee);

  return {
    productsSubtotal,
    deliveryFee: normalizedDeliveryFee,
    customerTotal: toMoney(productsSubtotal + normalizedDeliveryFee),
  };
}
