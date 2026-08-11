# GMA Lockers SaaS

Sistema SaaS B2B para la administración de casilleros (lockers), desarrollado por **Anderson Garcia (GMA)**.

## Arquitectura

El sistema se compone de 3 componentes independientes:

| Componente | Tecnología | Descripción |
|---|---|---|
| **📱 APK Cliente** | Expo SDK 56 / React Native | App Android offline-first para operarios del local |
| **☁️ Motor Nube** | Node.js 22+ (ESM) | Servidor 24/7 con WhatsApp (Baileys) y cron jobs |
| **💻 GMA Admin** | Electron v42 + React | Panel de escritorio (.exe) para el Super Administrador |

## Estructura del Proyecto

```
gma-lockers/
├── shared/            # Tipos TypeScript y constantes compartidas
├── cloud-engine/      # Motor Nube (Node.js + Baileys + Firebase Admin)
├── mobile-app/        # APK Cliente (Expo + React Native)
└── admin-desktop/     # Panel Admin (Electron + React)
```

## Requisitos

- **Node.js** >= 22.0.0
- **npm** >= 10.0.0
- **Firebase Project** configurado con Firestore
- **JDK 17** (para builds Android)

## Inicio Rápido

```bash
# Instalar dependencias de todos los workspaces
npm install

# Iniciar Motor Nube (desarrollo)
npm run cloud:dev

# Iniciar App Móvil (desarrollo)
npm run mobile:start

# Iniciar Panel Admin (desarrollo)
npm run desktop:dev
```

## Variables de Entorno

Copiar `.env.example` en cada componente y configurar:

### cloud-engine/.env
```
GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json
PORT=3000
NODE_ENV=development
```

## Licencia

Software propietario — © 2026 GMA. Todos los derechos reservados.
