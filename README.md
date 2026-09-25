# calculadora-web

Frontend de una **calculadora de préstamos** con el **sistema francés** (cuota fija): crea préstamos, muestra el cronograma de pagos y permite simular **amortizaciones extraordinarias** para ver cuánto se acorta el plazo y cuánto interés se ahorra.

🌐 **En producción:** https://calculadora-web-orcin.vercel.app · API: [calculadora-api](https://github.com/JustMaykol/calculadora-api)

## Funcionalidades

- Crear préstamos con monto, tasa **TEA o TCEA**, frecuencia (mensual a anual) y número de cuotas
- Listado de préstamos guardados
- Cronograma completo: saldo inicial, interés, amortización, cuota y saldo final por periodo
- **Amortización extraordinaria** sobre cualquier cuota pendiente, con el cronograma recalculado al instante
- Edición de las condiciones de un préstamo

## Páginas

| Ruta | Contenido |
|---|---|
| `/` | Formulario para crear un préstamo |
| `/prestamos` | Préstamos guardados |
| `/prestamos/[id]` | Cronograma, amortizaciones y edición |

## Stack

- Astro 5 (SSR) con el adaptador de Vercel
- React (islas) · TypeScript
- Tailwind CSS
- Despliegue en Vercel

## Configuración

| Variable | Descripción |
|---|---|
| `PUBLIC_API_URL` | URL base de calculadora-api, sin `/` final (por defecto `http://localhost:8000`) |

## Desarrollo local

```bash
npm install
cp .env.example .env   # PUBLIC_API_URL apuntando a la API
npm run dev            # http://localhost:4321
```

## Despliegue en Vercel

1. Importa el repositorio en Vercel (detecta Astro y usa `@astrojs/vercel`).
2. Configura `PUBLIC_API_URL` con la URL pública de la API en Render.

## Estructura

```
src/
├── components/
│   ├── LoanForm.tsx       # formulario de préstamo
│   └── ScheduleTable.tsx  # cronograma y amortizaciones
├── lib/api.ts             # cliente de la API
├── layouts/Layout.astro
└── pages/
    ├── index.astro
    └── prestamos/         # listado y detalle
```
