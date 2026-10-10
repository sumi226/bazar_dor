
import { Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import Header from "@/component/Header";
import { Suspense } from "react";
import Footer from "@/component/Footer"


const notoSerifBengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body className={notoSerifBengali.className}>
      <Suspense fallback={<div>Loading...</div>}>
      <Header />
    </Suspense>
    
        {children}
        <Footer/>
      </body>
    </html>
  );
}
