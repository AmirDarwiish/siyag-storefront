"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {ArrowUpRight,Banknote,CreditCard,MapPin,PackageCheck,ShieldCheck,ShoppingBag} from "lucide-react";
import {api,ApiError,imageUrl,money,name,type Quote,type Receipt,type Settings,type Shipping,type Tracking,type Cart} from "@/lib/store";
import {track,cartData,allowed} from "@/lib/analytics";
import {useStore} from "./store-context";
import {ReviewButton} from "./reviews";
import type {OrderProof} from "@/lib/reviews";
import {governorates} from "@/lib/governorates";
import {emptyCheckoutDetails,readCheckoutDetails,storeCheckoutDetails,type CheckoutDetails} from "@/lib/checkout-details";

function Summary({quote,subtotal}:{quote?:Quote;subtotal:number}){
  const {lang,tr}=useStore();
  return <dl className="order-totals">
    <div><dt>{tr("Subtotal","المجموع الفرعي")}</dt><dd>{money(quote?.subtotalMinor??subtotal,lang)}</dd></div>
    {quote&&<><div><dt>{tr("Delivery","الشحن")}</dt><dd>{money(quote.shippingMinor,lang)}</dd></div>
      {quote.discountMinor>0&&<div><dt>{tr("Discount","الخصم")}</dt><dd>− {money(quote.discountMinor,lang)}</dd></div>}
      {quote.taxMinor>0&&<div><dt>{quote.taxIncluded?tr("Tax included","ضريبة مشمولة"):tr("Tax","الضريبة")}</dt><dd>{money(quote.taxMinor,lang)}</dd></div>}</>}
    <div><dt>{tr("Total","الإجمالي")}</dt><dd>{quote?money(quote.totalMinor,lang):tr("Pending delivery","بعد اختيار التوصيل")}</dd></div>
  </dl>;
}


const previewShipping: Shipping[] = [
  {code:"preview-cairo",nameEn:"Standard delivery",nameAr:"توصيل عادي",governorate:"cairo",feeMinor:6500},
  {code:"preview-gharbia",nameEn:"Standard delivery",nameAr:"توصيل عادي",governorate:"gharbia",feeMinor:5000},
];
const previewSettings: Settings = {name:"SIYAG Parfums",acceptOrders:false,paymentMethods:["cashOnDelivery"]};

export function Checkout(){
  const {cart:regularCart,token:regularToken,clearCart,demo,busy,tr,lang,ar}=useStore();
  const [express,setExpress]=useState(false);
  const [expressCart,setExpressCart]=useState<Cart>();
  const [expressLoading,setExpressLoading]=useState(true);
  const [expressError,setExpressError]=useState(false);
  const [summaryOpen,setSummaryOpen]=useState(false);
  const expressToken=useRef("");
  const submitting=useRef(false);
  const began=useRef(false);
  const completed=useRef(false);
  const cart=express?(expressCart??{lines:[],subtotalMinor:0,currency:"EGP"}):regularCart;
  const token=()=>express?expressToken.current:regularToken();
  useEffect(()=>{
    if(new URLSearchParams(location.search).get("express")!=="1"){setExpressLoading(false);return}
    setExpress(true);
    let value="";try{value=sessionStorage.getItem("siyag-express-token")||""}catch{}
    if(!value){setExpressError(true);setExpressLoading(false);return}
    expressToken.current=value;
    if(demo){try{const preview=JSON.parse(sessionStorage.getItem("siyag-express-preview")||"null") as Cart|null;if(preview?.lines?.length)setExpressCart(preview);else setExpressError(true)}catch{setExpressError(true)}setExpressLoading(false);return}
    const controller=new AbortController();
    api<Cart>("store/cart",{token:value,signal:controller.signal}).then(setExpressCart).catch(()=>{if(!controller.signal.aborted)setExpressError(true)}).finally(()=>{if(!controller.signal.aborted)setExpressLoading(false)});
    return()=>controller.abort();
  },[demo]);
  useEffect(()=>{if(allowed()&&!expressLoading&&cart.lines.length&&!began.current){began.current=true;track("begin_checkout",{...cartData(cart),step:express?"express":"bag"})}},[cart,express,expressLoading]);
  useEffect(()=>{const exit=()=>{if(began.current&&!completed.current)track("checkout_exit",{step:"incomplete"})};window.addEventListener("pagehide",exit);return()=>{window.removeEventListener("pagehide",exit);exit()}},[]);
  const router=useRouter();
  const [settings,setSettings]=useState<Settings|undefined>(demo?previewSettings:undefined);
  const [shipping,setShipping]=useState<Shipping[]>(demo?previewShipping:[]);
  const [details,setDetails]=useState(emptyCheckoutDetails);
  const [rememberDetails,setRememberDetails]=useState(false);
  const {governorate}=details;
  function changeDetail(field:keyof CheckoutDetails,value:string){
    setDetails(previous=>({...previous,[field]:value}));
  }
  const [ship,setShip]=useState("");
  const [promotion,setPromotion]=useState("");
  const [applied,setApplied]=useState("");
  const [method,setMethod]=useState("cashOnDelivery");
  const [quote,setQuote]=useState<{key:string;value:Quote}>();
  const [error,setError]=useState("");
  const [pending,setPending]=useState(false);
  const [loading,setLoading]=useState(true);
  const key=JSON.stringify([governorate,ship,applied,cart.lines.map(l=>[l.variantId,l.quantity])]);
  const delivery=shipping.find(option=>option.code===ship && option.governorate===governorate);
  const activeQuote:Quote|undefined=demo
    ? delivery ? {subtotalMinor:cart.subtotalMinor,discountMinor:0,shippingMinor:delivery.feeMinor,taxMinor:0,taxIncluded:false,totalMinor:cart.subtotalMinor+delivery.feeMinor} : undefined
    : quote?.key===key?quote.value:undefined;
  useEffect(()=>{
    if(demo){setLoading(false);return}
    const stored=readCheckoutDetails();
    setRememberDetails(Boolean(stored));
    if(stored)setDetails(stored);
    const controller=new AbortController();
    const options={signal:controller.signal};
    Promise.all([api<Settings>("store/settings",options),api<Shipping[]>("store/shipping",options)]).then(([settings,shipping])=>{
      setSettings(settings);setShipping(shipping);setMethod(settings.paymentMethods[0]??"cashOnDelivery");
      if(stored?.governorate)setShip(shipping.find(option=>option.governorate===stored.governorate)?.code??"");
    }).catch(()=>{if(!controller.signal.aborted)setError("Could not load delivery and payment options.")}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
    return()=>controller.abort();
  },[demo]);
  useEffect(()=>{
    if(!demo&&rememberDetails)storeCheckoutDetails(details);
  },[demo,rememberDetails,details]);
  useEffect(()=>{
    if(demo||expressLoading||!ship||!governorate||!cart.lines.length)return;
    const controller=new AbortController();
    setError("");
    api<Quote>("store/cart/quote",{method:"POST",token:token(),data:{shippingCode:ship,governorate,promotionCode:applied||null},signal:controller.signal})
      .then(value=>{setQuote({key,value});track("add_shipping_info",{...cartData(cart),step:"delivery"});if(applied)track("coupon_apply",{result:"accepted"})}).catch(e=>{if(!controller.signal.aborted)setError(e.message)});
    return()=>controller.abort();
    // The quote key includes the shipping option, coupon and cart lines.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[key,demo,expressLoading]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(demo||expressLoading||!activeQuote||submitting.current||pending||!settings?.acceptOrders||cart.lines.some(line=>!line.available))return;
    const form=new FormData(event.currentTarget);
    submitting.current=true;setPending(true);setError("");
    track("add_payment_info",{...cartData(cart),payment_type:method,step:"submit"});
    try{
      const email=String(form.get("email")||"").trim();
      const receipt=await api<Receipt>("store/orders",{method:"POST",token:token(),data:{
        name:form.get("name"),phone:form.get("phone"),email:email||null,city:form.get("city"),address:form.get("address"),
        deliveryNotes:form.get("notes")||null,shippingCode:ship,governorate,promotionCode:applied||null,
        expectedTotalMinor:activeQuote.totalMinor,paymentMethod:method,
      }});
      const tracking="/track?order="+encodeURIComponent(receipt.number);
      let fallback="";
      try{sessionStorage.setItem("siyag-receipt",JSON.stringify(receipt))}
      catch{fallback="#token="+encodeURIComponent(receipt.trackingToken)}
      completed.current=true;
      track("order_placed",{transaction_id:receipt.number,value:receipt.total.totalMinor/100,payment_type:receipt.paymentMethod},{number:receipt.number,token:receipt.trackingToken});
      if(receipt.paymentMethod==="cashOnDelivery")track("purchase",{transaction_id:receipt.number},{number:receipt.number,token:receipt.trackingToken});
      if(express){try{sessionStorage.removeItem("siyag-express-token")}catch{}}else clearCart();
      router.push(tracking+fallback);
    }catch(e){
      if(e instanceof ApiError && e.code==="price-changed") {
        try {setQuote({key,value:await api<Quote>("store/cart/quote",{method:"POST",token:token(),data:{shippingCode:ship,governorate,promotionCode:applied||null}})});} catch {}
        setError(tr("The total changed. Review the updated quote before placing your order.","الإجمالي اتغير. راجع السعر الجديد قبل تأكيد الطلب."));
      } else setError(e instanceof Error?e.message:tr("Could not place your order.","تعذر تسجيل الطلب."));
    }finally{submitting.current=false;setPending(false)}
  }
  if(expressLoading)return <main className="container utility checkout-page"><p role="status">{tr("Preparing checkout…","جاري تجهيز الطلب…")}</p></main>;
  if(expressError)return <main className="container utility checkout-page"><h1>{tr("Checkout unavailable","تعذر تجهيز الطلب")}</h1><p role="alert">{tr("Your direct-purchase session is unavailable. Choose your fragrance again; your original bag is saved.","جلسة الشراء المباشر غير متاحة. اختار العطر تاني؛ حقيبتك الأصلية محفوظة.")}</p><Link className="action ink" href="/shop">{tr("Return to collection","العودة للتشكيلة")}</Link></main>;
  if(!cart.lines.length)return <main className="container utility checkout-page">
    <div className="checkout-empty">
      <ShoppingBag size={30}/><h1>{tr("Checkout","إتمام الطلب")}</h1>
      <p role="status">{busy?tr("Loading your bag…","جاري تحميل الحقيبة…"):tr("Add a fragrance to your bag to continue.","أضف عطرًا إلى حقيبتك لتتابع إتمام الطلب.")}</p>
      {!busy&&<Link className="action ink" href="/shop">{tr("Explore the collection","استكشف التشكيلة")}</Link>}
    </div>
  </main>;
  return <main className="container utility checkout-page">
    <div className="checkout-heading">
      <div><span className="eyebrow">SIYAG PARFUMS</span><h1>{tr("Checkout","إتمام الطلب")}</h1></div>
      <span className="checkout-secure"><ShieldCheck size={19}/>{tr("Secure checkout","إتمام طلب آمن")}</span>
    </div>
    {demo&&<p className="checkout-preview">{tr("Design preview · delivery charges are illustrative. Order submission is disabled.","معاينة التصميم · رسوم التوصيل توضيحية وتأكيد الطلب متوقف.")}</p>}
    <p className="checkout-intro">{tr("Your fragrance, a few details away. No account needed.","عطرك قرب يوصل لك. كمّل بياناتك بدون إنشاء حساب.")}</p>

    {express&&<p className="express-note">{tr("Direct purchase · items in your original bag stay saved.","شراء مباشر · منتجات حقيبتك الأصلية محفوظة.")}</p>}
    <button type="button" className="summary-toggle" aria-expanded={summaryOpen} aria-controls="checkout-summary" onClick={()=>setSummaryOpen(!summaryOpen)}>{tr(summaryOpen?"Hide order summary":"Show order summary",summaryOpen?"إخفاء ملخص الطلب":"عرض ملخص الطلب")}<strong>{money(activeQuote?.totalMinor??cart.subtotalMinor,lang)}</strong></button>
    <div className="checkout-grid">
      <form className="checkout-form" data-clarity-mask="true" onInvalidCapture={()=>track("checkout_validation",{result:"invalid_input"})} onSubmit={submit}><fieldset disabled={pending||loading}>
        <legend><MapPin size={21}/>{tr("Delivery details","بيانات التوصيل")}</legend>
        <div className="field-grid">
          <label>{tr("Full name","الاسم بالكامل")}<input name="name" value={details.name} onChange={e=>changeDetail("name",e.target.value)} autoComplete="name" required maxLength={120}/></label>
          <label>{tr("Mobile number","رقم الموبايل")}<input name="phone" value={details.phone} onChange={e=>changeDetail("phone",e.target.value)} type="tel" autoComplete="tel" inputMode="tel" dir="ltr" placeholder="01012345678" title={tr("Enter an Egyptian mobile number, e.g. 01012345678","أدخل رقم موبايل مصري مثل 01012345678")} required maxLength={13} pattern={"(?:01|\\+201)[0125][0-9]{8}"}/></label>
          <label>{method==="paymob"?tr("Email","البريد الإلكتروني"):tr("Email · optional","البريد الإلكتروني · اختياري")}<input name="email" value={details.email} onChange={e=>changeDetail("email",e.target.value)} type="email" autoComplete="email" required={method==="paymob"} maxLength={254}/></label>
          <label>{tr("Governorate","المحافظة")}<select required value={governorate} onChange={e=>{const next=e.target.value;changeDetail("governorate",next);setShip(shipping.find(s=>s.governorate===next)?.code??"")}}><option value="">{tr("Choose governorate","اختر المحافظة")}</option>{[...new Set(shipping.map(s=>s.governorate))].map(x=><option value={x} key={x}>{governorates[x]?.[ar?1:0]??x}</option>)}</select></label>
          <label>{tr("City / district","المدينة / المنطقة")}<input name="city" value={details.city} onChange={e=>changeDetail("city",e.target.value)} autoComplete="address-level2" required maxLength={100}/></label>
          <label>{tr("Delivery option","طريقة التوصيل")}<select required value={ship} onChange={e=>setShip(e.target.value)}><option value="">{tr("Choose delivery","اختر طريقة التوصيل")}</option>{shipping.filter(s=>s.governorate===governorate).map(s=><option value={s.code} key={s.code}>{name(s,lang)} · {money(s.feeMinor,lang)}</option>)}</select></label>
          <label className="wide">{tr("Street, building and apartment","الشارع والعمارة والشقة")}<input name="address" value={details.address} onChange={e=>changeDetail("address",e.target.value)} autoComplete="street-address" required maxLength={500}/></label>
          <label className="wide">{tr("Delivery notes · optional","ملاحظات التوصيل · اختياري")}<textarea name="notes" rows={2} maxLength={500}/></label>
        </div>
        {!demo&&<label className="remember-delivery">
          <input type="checkbox" checked={rememberDetails} onChange={event=>{
            const checked=event.target.checked;
            setRememberDetails(checked);
            if(!checked)storeCheckoutDetails(null);
          }}/>
          <span>{tr("Remember delivery details on this browser","افتكر بيانات التوصيل على المتصفح ده")}
            <small>{tr("Uncheck to remove the saved details.","شيل العلامة لو عايز تمسح البيانات المحفوظة.")}</small>
          </span>
        </label>}
        <div className="payment-options" role="group" aria-label={tr("Payment method","طريقة الدفع")}>
          <h2>{tr("Payment method","طريقة الدفع")}</h2>
          {(settings?.paymentMethods??[]).map(value=><label key={value} className="payment-choice" data-selected={method===value}>
            {value==="paymob"?<CreditCard size={19}/>:<Banknote size={19}/>}
            <span>{value==="paymob"?tr("Pay online with Paymob","ادفع أونلاين عبر Paymob"):tr("Cash on delivery","الدفع عند الاستلام")}</span>
            <input type="radio" name="paymentMethod" value={value} checked={method===value} onChange={()=>{setMethod(value);track("add_payment_info",{payment_type:value,step:"selection"})}}/>
          </label>)}
        </div>
        {!demo&&settings&&!settings.acceptOrders&&<p role="alert">{tr("Orders are temporarily paused.","الطلبات متوقفة مؤقتًا.")}</p>}
        {!loading&&!shipping.length&&<p role="alert">{tr("Delivery options haven’t been published yet.","خيارات التوصيل غير متاحة حاليًا.")}</p>}
        {error&&<p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="action ink" disabled={demo||!activeQuote||pending||!settings?.acceptOrders||cart.lines.some(l=>!l.available)}>{pending?tr("Placing your order…","جاري تسجيل الطلب…"):tr("Place order","تأكيد الطلب")}{activeQuote&&<strong>{money(activeQuote.totalMinor,lang)}</strong>}<ArrowUpRight size={16}/></button>
      <p className="purchase-note">{tr("By placing an order, review our","قبل تأكيد الطلب، راجع")} <Link className="text-link" href="/policies/terms">{tr("shopping terms","شروط التسوق")}</Link> · <Link className="text-link" href="/policies/returns">{tr("returns information","معلومات الاسترجاع")}</Link>.</p>
      </fieldset></form>
      <aside id="checkout-summary" className={`order-summary ${summaryOpen?"summary-expanded":""}`}>
        <h2><PackageCheck size={21}/>{tr("Order summary","ملخص الطلب")}</h2>
        {cart.lines.map(l=><div className="summary-line" key={l.variantId}><img src={imageUrl(l.image)} alt=""/><div><strong>{name(l,lang)}</strong><small>{l.sizeMl} {tr("ml","مل")} × {l.quantity}</small></div><span>{money(l.unitPriceMinor*l.quantity,lang)}</span></div>)}
        {!demo&&<form className="promo" onSubmit={e=>{e.preventDefault();setApplied(promotion.trim())}}><input autoComplete="off" value={promotion} onChange={e=>setPromotion(e.target.value)} maxLength={100} placeholder={tr("Promo code","كود الخصم")} aria-label={tr("Promo code","كود الخصم")}/><button type="submit" disabled={!ship||pending}>{tr("Apply","تطبيق")}</button></form>}
        {applied&&<button className="text-link" type="button" onClick={()=>{setApplied("");setPromotion("")}}>{tr("Remove promo code","إزالة كود الخصم")}</button>}
        <Summary quote={activeQuote} subtotal={cart.subtotalMinor}/>
      </aside>
    </div>
  </main>;
}

const orderLabels:Record<string,[string,string]>={pending:["Order received","تم استلام الطلب"],confirmed:["Confirmed","مؤكد"],processing:["Preparing your order","جاري التجهيز"],shipped:["On its way","في الطريق"],outForDelivery:["Out for delivery","مع المندوب"],delivered:["Delivered","تم التسليم"],cancelled:["Cancelled","ملغي"],deliveryFailed:["Delivery attempted","تعذّر التسليم"],returned:["Returned","تم الاسترجاع"],unpaid:["Awaiting payment","بانتظار الدفع"],collected:["Payment received","تم الدفع"],paid:["Payment received","تم الدفع"],failed:["Payment unsuccessful","الدفع لم يكتمل"],refunded:["Refunded","تم استرداد المبلغ"],pendingRefund:["Refund pending","الاسترداد قيد المراجعة"]};
export function Track({returning=false}:{returning?:boolean}){
  const {tr,lang}=useStore();
  const [number,setNumber]=useState("");
  const [phone,setPhone]=useState("");
  const [proof,setProof]=useState<OrderProof>();
  const [order,setOrder]=useState<Tracking>();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [returnSent,setReturnSent]=useState(false);
  function status(value:string){const labels=orderLabels[value];return labels?tr(labels[0],labels[1]):value}
  async function requestReturn(event:FormEvent<HTMLFormElement>){event.preventDefault();if(busy||!proof?.token||returnSent)return;const reason=String(new FormData(event.currentTarget).get("reason")||"").trim();if(!reason)return;setBusy(true);setError("");try{const result=await api<Tracking>("store/orders/return",{method:"POST",data:{number:order?.number,token:proof.token,reason}});setOrder(result);setReturnSent(true)}catch(e){setError(e instanceof Error?e.message:tr("Could not send your request.","تعذّر إرسال الطلب."))}finally{setBusy(false)}}
  async function find(credentials:OrderProof){
    if(busy)return;setBusy(true);setError("");
    try{
      const result=await api<Tracking>("store/orders/track",{method:"POST",data:credentials});
      setOrder(result);setProof(credentials);
      if(credentials.token&&(result.paymentMethod==="cashOnDelivery"||result.paymentStatus==="collected"))track("purchase",{transaction_id:result.number},{number:result.number,token:credentials.token});
    }catch{
      setOrder(undefined);setProof(undefined);
      setError(tr("We couldn’t find the order. Check the order number and mobile.","ملقيناش الطلب. راجع رقم الطلب ورقم الموبايل."));
    }finally{setBusy(false)}
  }
  useEffect(()=>{
    const query=new URLSearchParams(location.search);
    const fragment=new URLSearchParams(location.hash.slice(1));
    let receipt:Receipt|undefined;
    try {receipt=JSON.parse(sessionStorage.getItem("siyag-receipt")||"null")??undefined} catch {}
    const orderNumber=query.get("order")||receipt?.number||"";
    const token=fragment.get("token")||(receipt?.number===orderNumber?receipt?.trackingToken:"")||"";
    setNumber(orderNumber);
    if(orderNumber&&token)void find({number:orderNumber,token});
    if(fragment.has("token"))window.history.replaceState(window.history.state,"",location.pathname+location.search);
  },[]);
  async function pay(){
    setBusy(true);setError("");
    try{
      const result=await api<{checkoutUrl:string}>("store/orders/payment/paymob",{method:"POST",data:{number,token:proof?.token}});
      const url=new URL(result.checkoutUrl);
      if(url.protocol!=="https:"||url.hostname!=="accept.paymob.com")throw new Error("Invalid payment link.");
      location.assign(url.href);
    }catch(e){setError(e instanceof Error?e.message:"Payment unavailable.");setBusy(false)}
  }
  return <main className="container utility track-page">
    <span className="eyebrow">SIYAG PARFUMS</span><h1>{returning?tr("Payment status","حالة الدفع"):tr("Track your order","تتبّع طلبك")}</h1>
    <p>{tr("Enter your order number and the mobile number you used at checkout.","ادخل رقم الطلب ورقم الموبايل اللي استخدمته وقت الطلب.")}</p>
    <form className="checkout-form" onSubmit={e=>{e.preventDefault();void find({number:number.trim(),phone:phone.trim()})}}>
      <div className="field-grid"><label>{tr("Order number","رقم الطلب")}<input required maxLength={20} dir="ltr" value={number} onChange={e=>{setNumber(e.target.value);setOrder(undefined)}}/></label><label>{tr("Mobile number","رقم الموبايل")}<input type="tel" autoComplete="tel" dir="ltr" maxLength={13} pattern={"(?:01|\\+201)[0125][0-9]{8}"} required value={phone} onChange={e=>{setPhone(e.target.value);setOrder(undefined)}}/></label></div>
      <button type="submit" className="action ink" disabled={busy}>{busy?tr("Checking…","جاري التحقق…"):tr("Check status","راجع الحالة")}</button>
    </form>
    {error&&<p role="alert" className="form-error">{error}</p>}
    {order&&<section className="order-summary"><h2><ShieldCheck size={21}/> {order.number}</h2>
      <div className="order-status-panel"><h2>{returning?status(order.paymentStatus):status(order.status)}</h2><p>{tr("Order","الطلب")} · {status(order.status)}<br/>{tr("Payment","الدفع")} · {status(order.paymentStatus)}</p>{order.paymentMethod==="paymob"&&order.paymentStatus==="unpaid"&&<p>{tr("Payment has not been confirmed. You can retry through the secure receipt link. Your order status is verified with the store.","الدفع لم يتأكد بعد. تقدر تعيد المحاولة من رابط الإيصال الآمن. الحالة المعروضة متحققة من المتجر.")}</p>}</div>
      {order.events?.length>0&&<ol className="order-timeline" aria-label={tr("Order updates","تحديثات الطلب")}>{order.events.map((event,index)=><li key={event.at+index}><strong>{status(event.status)}</strong><time dateTime={event.at}>{new Date(event.at).toLocaleString(lang==="ar"?"ar-EG":"en-EG",{dateStyle:"medium",timeStyle:"short",timeZone:"Africa/Cairo"})}</time></li>)}</ol>}
      <button type="button" className="text-link" disabled={busy} onClick={()=>{if(proof)void find(proof)}}>{tr("Refresh order status","تحديث حالة الطلب")}</button>
      <Summary quote={order.total} subtotal={order.total.subtotalMinor}/>
      {(order.status==="delivered"||order.status==="returned")&&<ReviewButton proof={proof}/>}
      {order.status==="delivered"&&proof?.token&&<details className="return-request"><summary>{tr("Request a return review","طلب مراجعة استرجاع")}</summary>{returnSent?<p role="status">{tr("Your request was received for review.","وصل طلبك للمراجعة.")}</p>:<form onSubmit={requestReturn}><label>{tr("Tell us the reason","وضّح سبب الاسترجاع")}<textarea name="reason" required minLength={3} maxLength={500}/></label><p className="muted">{tr("Eligibility is checked by the store. Submission does not approve a refund.","المتجر هيراجع استحقاق الطلب. الإرسال مش موافقة تلقائية على استرداد المبلغ.")}</p><button className="action ink" type="submit" disabled={busy}>{busy?tr("Sending…","جاري الإرسال…"):tr("Send request","إرسال الطلب")}</button></form>}</details>}
      {order.carrierTrackingUrl?.startsWith("https://")&&<a className="text-link" href={order.carrierTrackingUrl} rel="noreferrer" target="_blank">{tr("Track shipment","تتبّع الشحنة")}<ArrowUpRight size={15}/></a>}
      {proof?.token&&order.paymentMethod==="paymob"&&order.paymentStatus==="unpaid"&&order.status==="pending"&&<button type="button" className="action gold" disabled={busy} onClick={pay}>{tr("Continue to Paymob","كمّل الدفع مع Paymob")}<ArrowUpRight size={15}/></button>}
    </section>}
  </main>;
}
