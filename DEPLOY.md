# Guía de Despliegue — CORPOSEPI STEREO

## Paso 1 — Crear base de datos en Supabase

1. Ve a **https://supabase.com** → "New Project"
2. Nombra el proyecto: `corposepi-stereo`
3. Elige región: **South America (São Paulo)** o la más cercana
4. Crea una contraseña segura y guárdala
5. Espera ~2 minutos mientras se crea el proyecto

6. Ve a **SQL Editor** (menú izquierdo)
7. Pega TODO el contenido del archivo `supabase-schema.sql`
8. Haz clic en **"Run"** — se crearán la tabla y los datos de ejemplo

9. Ve a **Database → Replication** → activa la tabla `programs` en Realtime

10. Ve a **Project Settings → API** y copia:
    - `Project URL` → va en `NEXT_PUBLIC_SUPABASE_URL`
    - `anon public` key → va en `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    - `service_role` key → va en `SUPABASE_SERVICE_ROLE_KEY`

---

## Paso 2 — Instalar dependencias localmente

```bash
cd "C:\Users\DEPERAVI\emisora corposepi"
npm install
```

---

## Paso 3 — Configurar variables de entorno

Copia el archivo de ejemplo y llénalo:

```bash
copy .env.local.example .env.local
```

Edita `.env.local` con los valores de Supabase y define:
- `ADMIN_USERNAME` y `ADMIN_PASSWORD` (tus credenciales de admin)
- `JWT_SECRET` (una cadena larga y aleatoria, ej: genera en https://generate-secret.vercel.app/32)

---

## Paso 4 — Probar localmente

```bash
npm run dev
```

Abre: http://localhost:4040

---

## Paso 5 — Subir el logo

Pon el archivo `logo.png` en la carpeta `public/`:

```
emisora corposepi/
└── public/
    └── logo.png   ← aquí
```

---

## Paso 6 — Deploy en Vercel

### Opción A — Desde GitHub (recomendado)

1. Sube el proyecto a GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: CORPOSEPI STEREO app"
   git remote add origin https://github.com/tu-usuario/corposepi-stereo.git
   git push -u origin main
   ```

2. Ve a **https://vercel.com** → "New Project"
3. Importa el repositorio de GitHub
4. Vercel detecta automáticamente que es Next.js

5. En **Environment Variables**, agrega TODAS las variables de `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_STREAM_URL`
   - `NEXT_PUBLIC_TIKAST_PANEL`

6. Haz clic en **Deploy** — en 2 minutos estará en línea con URL tipo:
   `https://corposepi-stereo.vercel.app`

### Opción B — Vercel CLI (directo)

```bash
npm install -g vercel
vercel
```
Sigue las instrucciones y configura las variables cuando las pida.

---

## Paso 7 — Dominio personalizado (opcional)

En Vercel → tu proyecto → **Settings → Domains**:
- Agrega `radio.corposepi.edu.co` o similar
- Configura el DNS en tu proveedor de dominio

---

## URLs finales

| Página | URL |
|--------|-----|
| App oyentes | `https://tu-app.vercel.app/` |
| Panel admin | `https://tu-app.vercel.app/admin` |
| Panel Tikast | `http://play14.tikast.com:2199` |
| Stream directo | `http://195.154.79.204:8019/stream` |

---

## Notas de seguridad

- ⚠️ Nunca subas `.env.local` a GitHub (ya está en `.gitignore`)
- Cambia `ADMIN_PASSWORD` por algo seguro antes de publicar
- El `JWT_SECRET` debe ser una cadena aleatoria de mínimo 32 caracteres
