
import { Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";
import Header from "@/component/Header";


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
        <Header />
    
        {children}
      </body>
    </html>
  );
}
