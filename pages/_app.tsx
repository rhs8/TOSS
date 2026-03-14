import type { AppProps } from "next/app";
import { Header } from "@/components/Header";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5DC] text-[#6B4423]" style={{ fontFamily: "system-ui, sans-serif" }}>
      <Header />
      <main className="flex-1">
        <Component {...pageProps} />
      </main>
    </div>
  );
}
