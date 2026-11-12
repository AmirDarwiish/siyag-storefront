/** Preserve the visible world position when recycling any number of native-swiped cards. */
export function normalizeRail(offset:number,step:number){
 if(!Number.isFinite(offset)||!Number.isFinite(step)||step<=0)return {crossed:0,offset:0};
 const crossed=Math.floor(offset/step);
 return {crossed,offset:offset-crossed*step};
}

/** Mobile always travels exactly one card in the language's visual direction. */
export function mobileRailPlan(scrollLeft:number,step:number,ar:boolean){
 const width=Number.isFinite(step)&&step>0?step:0;
 const anchor=ar?0:width,advance=ar?1:-1;
 return {anchor,advance,target:anchor+advance*width,rebase:width?Math.round(scrollLeft/width)-(ar?0:1):0};
}
export function railStepProgress(elapsed:number,duration:number){
 const t=duration>0?Math.max(0,Math.min(1,elapsed/duration)):1;
 return t*t*(3-2*t);
}

/** Production CSS can minify 4200ms to 4.2s; never discard the time unit. */
export function cssMilliseconds(value:string){
 const text=value.trim(),amount=Number.parseFloat(text);
 if(!Number.isFinite(amount))return 0;
 return Math.max(0,amount*(text.endsWith("ms")?1:text.endsWith("s")?1000:1));
}
