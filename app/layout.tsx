import type {Metadata} from "next";
import "./globals.css";
import "./theme/tokens.css";
import "./theme/storefront.css";
import {StorefrontFrame} from "@/components/storefront-frame";
import {storeMetadata,siteUrl} from "@/lib/metadata";
import {DEMO} from "@/lib/server-store";

export const metadata:Metadata={
  ...storeMetadata("SIYAG Parfums | Egyptian Fragrance House"),
  metadataBase:siteUrl,
  title:{default:"SIYAG Parfums | Egyptian Fragrance House",template:"%s | SIYAG Parfums"},
  ...(process.env.VERCEL_ENV==="preview"?{robots:{index:false,follow:false}}:{}),
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en" dir="ltr" suppressHydrationWarning><body><StorefrontFrame demo={DEMO}>{children}</StorefrontFrame></body></html>;
}
