/** Owner-approved public pricing and purchasing; backend inventory remains authoritative. */
export const commerce={showPrices:true,purchasingEnabled:true};
export function isPurchasePath(path:string){return /^store\/(?:carts|cart(?:\/.*)?|orders(?:\/payment\/paymob)?)$/.test(path)}
