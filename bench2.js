const cart = Array.from({ length: 10000 }, (_, i) => ({
  quantity: 2,
  price: 50.0
}));

console.time('Baseline (Two Reduces)');
for (let i = 0; i < 1000; i++) {
  const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);
}
console.timeEnd('Baseline (Two Reduces)');

console.time('Optimized (Single Reduce)');
for (let i = 0; i < 1000; i++) {
  const { totalQuantity, totalPrice } = cart.reduce(
    (acc, item) => {
      acc.totalQuantity += item.quantity;
      acc.totalPrice += item.quantity * item.price;
      return acc;
    },
    { totalQuantity: 0, totalPrice: 0 }
  );
}
console.timeEnd('Optimized (Single Reduce)');

console.time('Optimized (For Loop)');
for (let i = 0; i < 1000; i++) {
  let totalQuantity = 0;
  let totalPrice = 0;
  for (let j = 0; j < cart.length; j++) {
    const item = cart[j];
    totalQuantity += item.quantity;
    totalPrice += item.quantity * item.price;
  }
}
console.timeEnd('Optimized (For Loop)');

console.time('Optimized (For Of)');
for (let i = 0; i < 1000; i++) {
  let totalQuantity = 0;
  let totalPrice = 0;
  for (const item of cart) {
    totalQuantity += item.quantity;
    totalPrice += item.quantity * item.price;
  }
}
console.timeEnd('Optimized (For Of)');
