"use client"

import { useEffect } from "react"
import { useRouter } from "next/router"

export default function Page() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("looply_user")
    if (user) {
      router.push("/home")
    } else {
      router.push("/auth/sign-in")
    }
  }, [router])

  return null
}
