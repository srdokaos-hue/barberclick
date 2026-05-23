## Fix "BARBERCLICK ADMIN" no Dashboard

No arquivo `src/components/admin/Dashboard.tsx`, faça 2 mudanças:

### 1. Adicionar import no topo
```tsx
import { useShopInfo } from "@/lib/useShopInfo"
```

### 2. Dentro do componente (antes do return), adicionar:
```tsx
const { name: shopName } = useShopInfo()
```

### 3. Substituir o texto hardcoded:
Procura por: `BARBERCLICK ADMIN` (ou `"BARBERCLICK ADMIN"`)
Substitui por: `{shopName}`

Também substituir onde aparece como string:
- `"BarberClick Admin"` → `{shopName}`
- `"BARBERCLICK"` → `{shopName}`
