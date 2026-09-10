# Calculadora de Intereses — Web (calculadora-web)

**Astro** (SSR) + **React** (islands) + **Tailwind CSS**, pensado para desplegar en **Vercel** con el adaptador oficial `@astrojs/vercel`.

Repo hermano del backend: [calculadora-api](https://github.com/JustMaykol/calculadora-api).

## Desarrollo local

```bash
npm install
cp .env.example .env
# Edita .env con la URL del backend (por defecto http://localhost:8000)
npm run dev
```

Abre `http://localhost:4321`.

## Páginas

- `/` — formulario para crear un préstamo (monto, TEA/TCEA, frecuencia, número de cuotas).
- `/prestamos` — listado de préstamos guardados (vía backend/Neon).
- `/prestamos/[id]` — cronograma completo de cuotas, con la opción de amortizar cualquier cuota pendiente (abono extra a capital) y ver el cronograma recalculado al instante.

## Despliegue en Vercel

1. Importa el repositorio en Vercel y selecciona `frontend/` como raíz del proyecto.
2. Vercel detecta Astro automáticamente (usa `@astrojs/vercel`).
3. Configura la variable de entorno `PUBLIC_API_URL` apuntando a la URL pública del backend en Render.
