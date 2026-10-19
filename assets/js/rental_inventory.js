export const addRentalDays = (dateKey, amount) => {
  const date = new Date(`${dateKey}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dateKey) ||
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== dateKey
  ) {
    throw new Error("レンタル日を確認してください。");
  }
  date.setUTCDate(date.getUTCDate() + amount);
  return date.toISOString().slice(0, 10);
};

export const rentalDateKeys = (start, end) => {
  addRentalDays(end, 0);
  const dates = [];
  for (let date = start; date <= end; date = addRentalDays(date, 1)) {
    dates.push(date);
    if (dates.length > 90) throw new Error("レンタル期間を確認してください。");
  }
  if (!dates.length) throw new Error("レンタル期間を確認してください。");
  return dates;
};

export const inventoryRequirements = (order, products) => {
  const product = products[order.productId];
  if (!product || !Number.isInteger(order.quantity) || order.quantity < 1)
    throw new Error("商品と個数を確認してください。");
  const components =
    product.bundleComponents ||
    (order.productId === "fan"
      ? [
          { productId: "fan", quantity: 1 },
          { productId: "fan_case", quantity: 1 },
        ]
      : [{ productId: order.productId, quantity: 1 }]);
  return components.map((component) => {
    const source = products[component.productId];
    const variantId =
      order.variantSelections?.[component.productId] ||
      component.defaultVariant ||
      (source?.variants?.length === 1 ? source.variants[0].id : null);
    if (!source?.variants?.some((variant) => variant.id === variantId))
      throw new Error("商品の種類を選択してください。");
    return {
      productId: component.productId,
      variantId,
      quantity: order.quantity * (component.quantity || 1),
    };
  });
};

export const inventoryDayId = (productId, variantId, date) => `${productId}__${variantId}__${date}`;
