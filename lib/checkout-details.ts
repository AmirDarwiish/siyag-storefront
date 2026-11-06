import {readLocal,writeLocal} from "./browser-storage";
import {governorates} from "./governorates";

const storageKey="siyag-delivery-details-v1";
const maxLengths={name:120,phone:13,email:254,city:100,address:500,governorate:40};
export type CheckoutDetails=Record<keyof typeof maxLengths,string>;
export const emptyCheckoutDetails:CheckoutDetails={name:"",phone:"",email:"",city:"",address:"",governorate:""};

export function readCheckoutDetails():CheckoutDetails|null {
  const stored=readLocal(storageKey);
  if(!stored)return null;
  try{
    const parsed=JSON.parse(stored) as Partial<CheckoutDetails>|null;
    if(!parsed||typeof parsed!=="object")return null;
    const details={...emptyCheckoutDetails};
    for(const field of Object.keys(maxLengths) as (keyof CheckoutDetails)[]){
      const value=parsed[field];
      if(typeof value==="string")details[field]=value.slice(0,maxLengths[field]);
    }
    if(!Object.hasOwn(governorates,details.governorate))details.governorate="";
    return details;
  }catch{return null}
}

export function storeCheckoutDetails(details:CheckoutDetails|null) {
  writeLocal(storageKey,details?JSON.stringify(details):null);
}
