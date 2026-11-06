export type Review = {id:string;displayName:string;comment:string;rating:number;createdAt:string;hasPhoto:boolean;verifiedPurchase:boolean};
export type ReviewPage = {
  summary:{average:number;count:number;distribution:{rating:number;count:number}[]};
  data:Review[];pageNumber:number;totalPages:number;
};
export type OrderProof = {number:string;token?:string;phone?:string};

export async function reviewPhoto(file:File):Promise<Blob> {
  if(file.size>15_000_000)throw new Error("photo-too-large");
  const url=URL.createObjectURL(file);
  try{
    const image=new Image();
    image.src=url;
    await image.decode();
    const scale=Math.min(1,1440/Math.max(image.naturalWidth,image.naturalHeight));
    const canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
    canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    const context=canvas.getContext("2d");
    if(!context)throw new Error("photo-invalid");
    context.fillStyle="#fff";
    context.fillRect(0,0,canvas.width,canvas.height);
    context.drawImage(image,0,0,canvas.width,canvas.height);
    const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/jpeg",.82));
    if(!blob||blob.size>1_500_000)throw new Error("photo-invalid");
    return blob;
  }finally{URL.revokeObjectURL(url)}
}
