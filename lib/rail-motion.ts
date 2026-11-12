/** Preserve the visible world position when recycling any number of native-swiped cards. */
export function normalizeRail(offset:number,step:number){
 if(!Number.isFinite(offset)||!Number.isFinite(step)||step<=0)return {crossed:0,offset:0};
 const crossed=Math.floor(offset/step);
 return {crossed,offset:offset-crossed*step};
}
