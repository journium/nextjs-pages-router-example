import type { AppProps } from "next/app"
import { Geist, Geist_Mono } from "next/font/google"
import "@/styles/globals.css"
import { NextJourniumProvider } from '@journium/nextjs'
import { StoreProvider } from "@/lib/store"
import { Toaster } from "sonner"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  preload: true,
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className={`${geist.variable} ${geistMono.variable}`}>
      <NextJourniumProvider>
        <StoreProvider>
          <Toaster />
          <Component {...pageProps} />
        </StoreProvider>
      </NextJourniumProvider>
    </div>
  )
}
