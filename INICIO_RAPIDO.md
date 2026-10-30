# Cómo abrir la microapp en Visual Studio Code

1. Descomprime el ZIP y abre la carpeta `parroquia-santiago-munaypata` en **Visual Studio Code**.
2. Abre una terminal (**Terminal → Nueva terminal**).
3. Comprueba que tienes **Node.js 22.13 o superior**: `node -v`.
4. Ejecuta `npm install` con Internet.
5. Copia `.env.example` a `.env`:
   - **Windows:** `copy .env.example .env`
   - **macOS / Linux:** `cp .env.example .env`
6. Abre `.env` y reemplaza la contraseña `ADMIN_PASSWORD` y el secreto `SESSION_SECRET` por valores únicos, largos y privados.
7. Inicia: `npm run dev`.
8. Abre **http://localhost:4321** en tu navegador.
9. Para editar información, abre **http://localhost:4321/admin/login** e ingresa la contraseña que pusiste en `.env`.
10. Entra a **Ajustes del sitio**, sube el logo oficial, personaliza los colores, revisa los requisitos y activa las preinscripciones cuando la parroquia autorice su uso.

**Para un servidor público:** ejecuta `npm run build` y `npm run start` en un alojamiento Node 22+ con almacenamiento persistente. Lee `README.md` antes de publicar y manejar información personal.
