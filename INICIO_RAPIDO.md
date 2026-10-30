# Cómo abrir la microapp en Visual Studio Code

1. Descomprime el ZIP y abre la carpeta `parroquia-santiago-munaypata` en **Visual Studio Code**.
2. Abre una terminal (**Terminal → Nueva terminal**).
3. Comprueba que tienes **Bun 1.4.3 o superior** (`bun --version`) y **Node.js 22.22 o superior** (`node -v`) para las herramientas de Astro.
4. Ejecuta `bun install` con Internet.
5. Copia `.env.example` a `.env`:
   - **Windows:** `copy .env.example .env`
   - **macOS / Linux:** `cp .env.example .env`
6. Abre `.env` y reemplaza la contraseña `ADMIN_PASSWORD` y el secreto `SESSION_SECRET` por valores únicos, largos y privados.
7. Inicia: `bun run dev`.
8. Abre **http://localhost:4321** en tu navegador.
9. Para editar información, abre **http://localhost:4321/admin/login** e ingresa la contraseña que pusiste en `.env`.
10. Entra a **Ajustes del sitio**, sube el logo oficial, personaliza los colores, revisa los requisitos y activa las preinscripciones cuando la parroquia autorice su uso.

**Para un servidor público:** ejecuta `bun run build` y `bun run start` en un alojamiento Node 22.22+ con Bun para ejecutar los comandos y con almacenamiento persistente. Lee `README.md` antes de publicar y manejar información personal.
