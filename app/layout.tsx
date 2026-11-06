import type {Metadata} from "next";
import "./globals.css";
import "./storefront.css";
import "./editorial.css";
import "./reviews.css";
import {StorefrontFrame} from "@/components/storefront-frame";
import {DEMO} from "@/lib/server-store";

export const metadata:Metadata={
  title:{default:"SIYAG Parfums | Egyptian Fragrance House",template:"%s | SIYAG Parfums"},
  description:"Discover SIYAG, an Egyptian fragrance house. Explore the collection by scent, concentration and size.",
  ...(DEMO?{robots:{index:false,follow:false}}:{}),
};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en" dir="ltr" suppressHydrationWarning><body><StorefrontFrame demo={DEMO}>{children}</StorefrontFrame></body></html>;
}
