"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {useEffect,useState,type FormEvent} from "react";
import {ArrowUpRight,Banknote,CreditCard,MapPin,PackageCheck,ShieldCheck,ShoppingBag} from "lucide-react";
import {api,ApiError,imageUrl,money,name,type Quote,type Receipt,type Settings,type Shipping,type Tracking} from "@/lib/store";
import {useStore} from "./store-context";

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

const governorates:Record<string,[string,string]>={gharbia:["Gharbia","الغربية"],cairo:["Cairo","القاهرة"],giza:["Giza","الجيزة"],alexandria:["Alexandria","الإسكندرية"],dakahlia:["Dakahlia","الدقهلية"],sharqia:["Sharqia","الشرقية"],qalyubia:["Qalyubia","القليوبية"],menoufia:["Menoufia","المنوفية"],beheira:["Beheira","البحيرة"],sohag:["Sohag","سوهاج"]};

const previewShipping: Shipping[] = [
  {code:"preview-cairo",nameEn:"Standard delivery",nameAr:"توصيل عادي",governorate:"cairo",feeMinor:6500},
  {code:"preview-gharbia",nameEn:"Standard delivery",nameAr:"توصيل عادي",governorate:"gharbia",feeMinor:5000},
];
const previewSettings: Settings = {name:"SIYAG Parfums",acceptOrders:false,paymentMethods:["cashOnDelivery"]};

export function Checkout(){
  const {cart,token,clearCart,demo,busy,tr,lang,ar}=useStore();
  const router=useRouter();
  const [settings,setSettings]=useState<Settings|undefined>(demo?previewSettings:undefined);
  const [shipping,setShipping]=useState<Shipping[]>(demo?previewShipping:[]);
  const [governorate,setGovernorate]=useState("");
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
    const controller=new AbortController();
    const options={signal:controller.signal};
    Promise.all([api<Settings>("store/settings",options),api<Shipping[]>("store/shipping",options)]).then(([settings,shipping])=>{
      setSettings(settings);setShipping(shipping);setMethod(settings.paymentMethods[0]??"cashOnDelivery");
    }).catch(()=>{if(!controller.signal.aborted)setError("Could not load delivery and payment options.")}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});
    return()=>controller.abort();
  },[demo]);
  useEffect(()=>{
    if(demo||!ship||!governorate||!cart.lines.length)return;
    const controller=new AbortController();
    setError("");
    api<Quote>("store/cart/quote",{method:"POST",token:token(),data:{shippingCode:ship,governorate,promotionCode:applied||null},signal:controller.signal})
      .then(value=>setQuote({key,value})).catch(e=>{if(!controller.signal.aborted)setError(e.message)});
    return()=>controller.abort();
    // The quote key includes the shipping option, coupon and cart lines.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[key,demo]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(demo||!activeQuote||pending||!settings?.acceptOrders||cart.lines.some(line=>!line.available))return;
    const form=new FormData(event.currentTarget);
    setPending(true);setError("");
    try{
      const email=String(form.get("email")||"").trim();
      const receipt=await api<Receipt>("store/orders",{method:"POST",token:token(),data:{
        name:form.get("name"),phone:form.get("phone"),email:email||null,city:form.get("city"),address:form.get("address"),
        deliveryNotes:form.get("notes")||null,shippingCode:ship,governorate,promotionCode:applied||null,
        expectedTotalMinor:activeQuote.totalMinor,paymentMethod:method,
      }});
      sessionStorage.setItem("siyag-receipt",JSON.stringify(receipt));
      clearCart();
      router.push("/track?order="+encodeURIComponent(receipt.number));
    }catch(e){
      if(e instanceof ApiError && e.code==="price-changed") {
        try {setQuote({key,value:await api<Quote>("store/cart/quote",{method:"POST",token:token(),data:{shippingCode:ship,governorate,promotionCode:applied||null}})});} catch {}
        setError(tr("The total changed. Review the updated quote before placing your order.","الإجمالي اتغير. راجع السعر الجديد قبل تأكيد الطلب."));
      } else setError(e instanceof Error?e.message:tr("Could not place your order.","تعذر تسجيل الطلب."));
    }finally{setPending(false)}
  }
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
    <div className="checkout-grid">
      <form className="checkout-form" onSubmit={submit}><fieldset disabled={pending||loading}>
        <legend><MapPin size={21}/>{tr("Delivery details","بيانات التوصيل")}</legend>
        <div className="field-grid">
          <label>{tr("Full name","الاسم بالكامل")}<input name="name" autoComplete="name" required maxLength={120}/></label>
          <label>{tr("Mobile number","رقم الموبايل")}<input name="phone" type="tel" autoComplete="tel" required pattern="(?:01|\\+201)[0125][0-9]{8}"/></label>
          <label>{tr("Email","البريد الإلكتروني")}<input name="email" type="email" autoComplete="email" required={method==="paymob"} maxLength={254}/></label>
          <label>{tr("Governorate","المحافظة")}<select required value={governorate} onChange={e=>{const next=e.target.value;setGovernorate(next);setShip(shipping.find(s=>s.governorate===next)?.code??"")}}><option value="">{tr("Choose governorate","اختر المحافظة")}</option>{[...new Set(shipping.map(s=>s.governorate))].map(x=><option value={x} key={x}>{governorates[x]?.[ar?1:0]??x}</option>)}</select></label>
          <label>{tr("City / district","المدينة / المنطقة")}<input name="city" autoComplete="address-level2" required maxLength={100}/></label>
          <label>{tr("Delivery option","طريقة التوصيل")}<select required value={ship} onChange={e=>setShip(e.target.value)}><option value="">{tr("Choose delivery","اختر طريقة التوصيل")}</option>{shipping.filter(s=>s.governorate===governorate).map(s=><option value={s.code} key={s.code}>{name(s,lang)} · {money(s.feeMinor,lang)}</option>)}</select></label>
          <label className="wide">{tr("Street, building and apartment","الشارع والعمارة والشقة")}<input name="address" autoComplete="street-address" required maxLength={500}/></label>
          <label className="wide">{tr("Delivery notes · optional","ملاحظات التوصيل · اختياري")}<textarea name="notes" maxLength={500}/></label>
        </div>
        <div className="payment-options" role="group" aria-label={tr("Payment method","طريقة الدفع")}>
          <h2>{tr("Payment method","طريقة الدفع")}</h2>
          {(settings?.paymentMethods??[]).map(value=><label key={value} className="payment-choice" data-selected={method===value}>
            {value==="paymob"?<CreditCard size={19}/>:<Banknote size={19}/>}
            <span>{value==="paymob"?tr("Pay online with Paymob","ادفع أونلاين عبر Paymob"):tr("Cash on delivery","الدفع عند الاستلام")}</span>
            <input type="radio" name="paymentMethod" value={value} checked={method===value} onChange={()=>setMethod(value)}/>
          </label>)}
        </div>
        {!demo&&settings&&!settings.acceptOrders&&<p role="alert">{tr("Orders are temporarily paused.","الطلبات متوقفة مؤقتًا.")}</p>}
        {!loading&&!shipping.length&&<p role="alert">{tr("Delivery options haven’t been published yet.","خيارات التوصيل غير متاحة حاليًا.")}</p>}
        {error&&<p className="form-error" role="alert">{error}</p>}
        <button type="submit" className="action ink" disabled={demo||!activeQuote||pending||!settings?.acceptOrders||cart.lines.some(l=>!l.available)}>{pending?tr("Placing your order…","جاري تسجيل الطلب…"):tr("Place order","تأكيد الطلب")}{activeQuote&&<strong>{money(activeQuote.totalMinor,lang)}</strong>}<ArrowUpRight size={16}/></button>
      </fieldset></form>
      <aside className="order-summary">
        <h2><PackageCheck size={21}/>{tr("Order summary","ملخص الطلب")}</h2>
        {cart.lines.map(l=><div className="summary-line" key={l.variantId}><img src={imageUrl(l.image)} alt=""/><div><strong>{name(l,lang)}</strong><small>{l.sizeMl} {tr("ml","مل")} × {l.quantity}</small></div><span>{money(l.unitPriceMinor*l.quantity,lang)}</span></div>)}
        {!demo&&<form className="promo" onSubmit={e=>{e.preventDefault();setApplied(promotion.trim())}}><input value={promotion} onChange={e=>setPromotion(e.target.value)} maxLength={100} placeholder={tr("Promo code","كود الخصم")} aria-label={tr("Promo code","كود الخصم")}/><button type="submit" disabled={!ship||pending}>{tr("Apply","تطبيق")}</button></form>}
        {applied&&<button className="text-link" type="button" onClick={()=>{setApplied("");setPromotion("")}}>{tr("Remove promo code","إزالة كود الخصم")}</button>}
        <Summary quote={activeQuote} subtotal={cart.subtotalMinor}/>
      </aside>
    </div>
  </main>;
}

export function Track({returning=false}:{returning?:boolean}){
  const {tr,lang}=useStore();
  const [number,setNumber]=useState("");
  const [secret,setSecret]=useState("");
  const [order,setOrder]=useState<Tracking>();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function find(orderNumber:string,token:string){
    setBusy(true);setError("");
    try{setOrder(await api<Tracking>("store/orders/track",{method:"POST",data:{number:orderNumber.trim(),token:token.trim()}}))}
    catch(e){setOrder(undefined);setError(e instanceof Error?e.message:"Order unavailable.")}
    finally{setBusy(false)}
  }
  useEffect(()=>{
    const query=new URLSearchParams(location.search);
    const fragment=new URLSearchParams(location.hash.slice(1));
    let receipt:Receipt|undefined;
    try {receipt=JSON.parse(sessionStorage.getItem("siyag-receipt")||"null")??undefined} catch {}
    const orderNumber=query.get("order")||receipt?.number||"";
    const token=fragment.get("token")||(receipt?.number===orderNumber?receipt?.trackingToken:"")||"";
    setNumber(orderNumber);setSecret(token);
    if(orderNumber&&token)void find(orderNumber,token);
    if(fragment.has("token"))window.history.replaceState(window.history.state,"",location.pathname+location.search);
  },[]);
  async function pay(){
    setBusy(true);setError("");
    try{
      const result=await api<{checkoutUrl:string}>("store/orders/payment/paymob",{method:"POST",data:{number,token:secret}});
      const url=new URL(result.checkoutUrl);
      if(url.protocol!=="https:"||url.hostname!=="accept.paymob.com")throw new Error("Invalid payment link.");
      location.assign(url.href);
    }catch(e){setError(e instanceof Error?e.message:"Payment unavailable.");setBusy(false)}
  }
  return <main className="container utility track-page">
    <span className="eyebrow">SIYAG PARFUMS</span><h1>{returning?tr("Payment status","حالة الدفع"):tr("Track your order","تتبّع طلبك")}</h1>
    <p>{tr("Enter your order number and the tracking code from your receipt.","ادخل رقم الطلب وكود التتبع من الإيصال.")}</p>
    <form className="checkout-form" onSubmit={e=>{e.preventDefault();void find(number,secret)}}>
      <div className="field-grid"><label>{tr("Order number","رقم الطلب")}<input required value={number} onChange={e=>{setNumber(e.target.value);setOrder(undefined)}}/></label><label>{tr("Tracking code","كود التتبع")}<input required value={secret} onChange={e=>{setSecret(e.target.value);setOrder(undefined)}}/></label></div>
      <button type="submit" className="action ink" disabled={busy}>{busy?tr("Checking…","جاري التحقق…"):tr("Check status","راجع الحالة")}</button>
    </form>
    {error&&<p role="alert" className="form-error">{error}</p>}
    {order&&<section className="order-summary"><h2><ShieldCheck size={21}/> {order.number}</h2>
      <p>{tr("Order","الطلب")} · {order.status} <br/>{tr("Payment","الدفع")} · {order.paymentStatus}</p>
      <Summary quote={order.total} subtotal={order.total.subtotalMinor}/>
      {order.carrierTrackingUrl?.startsWith("https://")&&<a className="text-link" href={order.carrierTrackingUrl} rel="noreferrer" target="_blank">{tr("Track shipment","تتبّع الشحنة")}<ArrowUpRight size={15}/></a>}
      {order.paymentMethod==="paymob"&&order.paymentStatus==="unpaid"&&order.status==="pending"&&<button type="button" className="action gold" disabled={busy} onClick={pay}>{tr("Continue to Paymob","كمّل الدفع مع Paymob")}<ArrowUpRight size={15}/></button>}
    </section>}
  </main>;
}
