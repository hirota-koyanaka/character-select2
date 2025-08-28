"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TopPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative">
      <div 
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: "url('/images/background.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"
        }}
      />
      <div className="absolute inset-0 bg-gray-700/60 -z-10" />
      <div className="text-center space-y-12">
        <img 
          src="/images/title.png" 
          alt="BAN/PICK CHARACTER SELECT"
          className="mx-auto h-20 md:h-32 lg:h-40 w-auto"
        />
        <Link href="/character-select">
          <Button 
            size="lg" 
            className="text-2xl px-12 py-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transform transition hover:scale-105"
          >
            START
          </Button>
        </Link>
      </div>
    </div>
  )
}