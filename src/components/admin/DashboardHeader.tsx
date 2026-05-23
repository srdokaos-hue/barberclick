"use client"
import { useShopInfo } from "@/lib/useShopInfo"
// Exporta o nome da barbearia para ser usado no Dashboard
export function useAdminLabel() {
  const { name } = useShopInfo()
  return name
}
