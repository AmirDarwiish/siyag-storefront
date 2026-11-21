/** Public storefront controls. Keep operational prices and inventory in the back office. */
export const commerce={showPrices:false,purchasingEnabled:false};
export function isPurchasePath(path:string){return /^store\/(?:carts|cart(?:\/.*)?|orders(?:\/payment\/paymob)?)$/.test(path)}
