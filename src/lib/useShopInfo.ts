import { useState, useEffect } from "react"
export function useShopInfo() {
  const [name, setName] = useState("Admin")
  const [slug, setSlug] = useState("")
  useEffect(() => {
    const load = () => {
      const n = localStorage.getItem("shopName")
      const s = localStorage.getItem("shopSlug")
      if (n) setName(n)
      if (s) setSlug(s)
    }
    load()
    window.addEventListener("settingsUpdated", load)
    return () => window.removeEventListener("settingsUpdated", load)
  }, [])
  return { name, slug }
}
