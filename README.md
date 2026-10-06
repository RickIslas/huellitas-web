# 🐾 Huellitas — Plataforma Digital de Adopción, Rescate GPS y Bienestar Animal

![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore_%7C_Auth_%7C_Hosting-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![CI/CD](https://img.shields.io/badge/DevOps-CI%2FCD_GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Quality](https://img.shields.io/badge/Code_Quality-SonarQube_%26_Oxlint-4E9BCD?style=for-the-badge&logo=sonarqube&logoColor=white)

> **🌐 Demo en Producción (Firebase Hosting):** [https://huellitas-47cc5.web.app](https://huellitas-47cc5.web.app)  
> **Desarrollado por:** **Cody Go** y **TechNova** (División de Informática y Computación • UTN)

---

## 📋 1. Descripción del Caso de Estudio

**Huellitas** es una plataforma web centralizada desarrollada para reducir la población de perros y gatos en situación de calle y garantizar su bienestar. El sistema digitaliza y articula los procesos de rescate, atención veterinaria, control de esterilizaciones, alertas de extravío con geolocalización GPS y adopción responsable en colaboración directa con refugios y fundaciones aliadas.

### Problemática que Soluciona
* **Alta población de animales en situación de calle:** Crecimiento descontrolado de perros y gatos abandonados.
* **Falta de concientización sobre tenencia responsable:** Desinformación sobre procesos de adopción y esterilización.
* **Desorganización en procesos de rescate y adopción:** Ausencia de una plataforma digital centralizada, segura y trazable que conecte a ciudadanos, refugios, clínicas y donantes.

---

## 🚀 2. Principales Funcionalidades y Arquitectura

1. **Gestión de Adopciones y Algoritmo de *Match Ideal*:**
   * Catálogo interactivo con filtros por tamaño, estado, búsqueda inteligente y recomendación personalizada según el tipo de vivienda y preferencias guardadas en el perfil del usuario.
   * Formulario digital de Pre-Adopción con auto-llenado de perfil y dictamen en tiempo real (`Pendiente`, `Aprobada`, `Rechazada`).
2. **Alertas de Mascotas Perdidas con GPS y WhatsApp Directo:**
   * Obtención de coordenadas exactas (`lat`, `lng`) en tiempo real mediante el GPS del celular/navegador (`navigator.geolocation`) y geocodificación inversa.
   * Botones de acción inmediata en cada reporte: **WhatsApp directo al dueño**, **Llamada telefónica (`tel:`)** y **Pin en Google Maps**.
3. **Motor de Carga y Optimización de Imágenes Locales:**
   * Subida de fotografías directamente desde el dispositivo móvil o PC con compresión automática en cliente mediante HTML5 Canvas.
4. **Donaciones con Folio de Trazabilidad:**
   * Aportes predefinidos ($150, $300, $500, $1,000 MXN o monto libre) asignados a un refugio específico con generación de folio único (`HUE-XXXX`).
5. **Seguridad Basada en Roles (RBAC) y Panel de Administración:**
   * Autenticación con **Google OAuth** y **Correo/Contraseña**.
   * Protección a nivel servidor mediante **Firestore Security Rules (`isAdmin()`)** para administración de mascotas, alta de refugios aliados, auditoría financiera y control de usuarios.

---

## ⚙️ 3. Documentación de Ingeniería bajo Enfoque DevOps

### 3.1 Plan y Casos de Prueba

#### Alcance del Plan de Pruebas
* **Análisis Estático de Código:** Revisión continua mediante **SonarQube** y **Oxlint** para asegurar estándares de accesibilidad (WCAG), eliminación de código muerto y prevención de vulnerabilidades XSS.
* **Pruebas de Integración y Base de Datos:** Verificación de sincronización en tiempo real (`onSnapshot`) con colecciones de **Cloud Firestore** (`pets`, `reports`, `shelters`, `adoptions`, `donations`, `users`).
* **Pruebas de Seguridad y Permisos:** Validación de reglas de seguridad en Firestore para impedir escalamiento de privilegios desde el cliente.
* **Pruebas de Responsividad (UI/UX):** Diseño *Mobile-First* validado en resoluciones móviles (360px), tablets (768px) y monitores de escritorio (1440px).

#### Matriz de Casos de Prueba

| ID | Módulo | Caso de Prueba | Precondiciones | Pasos de Ejecución | Resultado Esperado | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **CP-01** | Autenticación | Login de usuario con Google OAuth y creación de perfil | Proveedor Google activo en Firebase Auth | 1. Ir a *Iniciar Sesión* -> *Acceso Usuarios*.<br>2. Clic en *Continuar con Google*.<br>3. Seleccionar cuenta. | Se crea el documento en `users/{uid}` con `role: "Usuario"` y se sincronizan sus preferencias. | ✅ Aprobado |
| **CP-02** | Seguridad RBAC | Bloqueo de acceso no autorizado al Panel Admin | Usuario autenticado con `role: "Usuario"` | 1. Intentar ingresar a *Portal Admin*.<br>2. Enviar credenciales de usuario estándar. | El sistema verifica en Firestore, deniega el acceso al Dashboard y mantiene ocultos los controles CRUD. | ✅ Aprobado |
| **CP-03** | Adopciones | Envío de solicitud de Pre-Adopción con datos de perfil | Sesión activa y mascota con estado `disponible` | 1. Seleccionar mascota en catálogo.<br>2. Completar *Formulario de Adopción*.<br>3. Enviar solicitud. | Se guarda en la colección `adoptions` con estado `"Pendiente"` y aparece en *Mi Perfil* y en el *Panel Admin*. | ✅ Aprobado |
| **CP-04** | Alertas GPS | Publicación de mascota perdida con GPS y atajo WhatsApp | Permiso de ubicación concedido en el navegador/celular | 1. Ir a *Alertas GPS* -> *Publicar*.<br>2. Tocar *Usar ubicación GPS*.<br>3. Subir foto local e ingresar teléfono. | Se guardan coordenadas exactas y se activan los botones *WhatsApp Dueño*, *Llamar Ahora* y *Ver en Mapa GPS*. | ✅ Aprobado |
| **CP-05** | Refugios (Admin) | Alta de nuevo Refugio Aliado con logotipo local | Sesión activa con `role: "Administrador"` en Firestore | 1. Ir a *Panel Admin* -> *Refugios*.<br>2. Capturar datos, redes y subir logo.<br>3. Guardar. | El refugio se almacena en `shelters` y se publica en tiempo real en el directorio público. | ✅ Aprobado |
| **CP-06** | Finanzas | Registro de donación con generación de folio único | Acceso público o usuario autenticado | 1. Elegir monto ($150–$1,000 MXN) y refugio.<br>2. Seleccionar pasarela y confirmar. | Se genera folio (`HUE-XXXX`), se almacena en `donations` y se actualiza el estado de resultados en el Dashboard. | ✅ Aprobado |

---

### 3.2 Flujo de Trabajo para el Control de Versiones (GitFlow)

El repositorio implementa el flujo de trabajo **GitFlow** para mantener aislada la versión de producción del desarrollo diario del equipo:

* **`main` (Rama de Producción):** Contiene exclusivamente código estable, auditado y desplegado en `https://huellitas-47cc5.web.app`.
* **`develop` (Rama de Integración):** Rama donde se integran y prueban en conjunto las funcionalidades creadas por el equipo.
* **`feature/<modulo>` (Ramas de Funcionalidad):** Ramas creadas a partir de `develop` para nuevos módulos (ej. `feature/alertas-gps-whatsapp`, `feature/match-adopciones`, `feature/admin-refugios`).
* **`hotfix/<parche>` (Ramas de Corrección Urgente):** Ramas para resolver incidencias críticas detectadas en producción.

#### Convención de Commits (*Conventional Commits*)
* `feat:` Nuevas características (ej. `feat: agregar geolocalización GPS y botón de WhatsApp en alertas`).
* `fix:` Corrección de errores (ej. `fix: reemplazar ícono deprecado por componente SVG nativo`).
* `security:` Reglas de seguridad (ej. `security: implementar validación isAdmin() en reglas de Firestore`).
* `docs:` Documentación técnica y casos de prueba.

---

### 3.3 Estrategia de Liberación y Despliegue

El proyecto opera sobre un esquema de **3 entornos** bajo **Versionado Semántico (`v1.0.0`)**:

1. **Entorno de Desarrollo (`Local Development`):** Servidor local con Vite (`npm run dev`), recarga en caliente (HMR) y análisis estático en vivo con SonarQube.
2. **Entorno de Construcción y Pre-Liberación (`Staging / Build`):** Empaquetado, minificación de JS/CSS y optimización de *assets* mediante `npm run build` hacia el directorio `/dist`.
3. **Entorno de Producción (`Production CDN`):** Publicación atómica en **Firebase Hosting** (`firebase deploy --only hosting`) con certificado SSL automático (`HTTPS`), indispensable para el funcionamiento de la API de Geolocalización GPS en dispositivos móviles.
4. **Estrategia de *Rollback*:** Firebase Hosting conserva el historial de versiones publicadas, permitiendo revertir a una versión previa estable en un clic desde la consola en caso de contingencia, garantizando cero tiempo de inactividad (*Zero-Downtime Deployment*).

---

### 3.4 Integración y Entrega Continua (CI/CD)

El pipeline automatizado (`.github/workflows/ci-cd.yml`) ejecuta las fases de Integración y Entrega Continua en cada *Push* o *Pull Request*:

```text
[Desarrollo Local + SonarQube] ──(git push)──> [GitHub: feature/* -> develop -> main]
                                                               │
                                                               ▼
                                          ┌─────────────────────────────────────────┐
                                          │ 1. INTEGRACIÓN CONTINUA (GitHub Actions)│
                                          │ • Entorno limpio Ubuntu + Node.js 20    │
                                          │ • Instalación determinista (npm ci)     │
                                          │ • Verificación de compilación (build)   │
                                          └────────────────────┬────────────────────┘
                                                               │ (Build Exitoso)
                                                               ▼
                                          ┌─────────────────────────────────────────┐
                                          │ 2. ENTREGA Y DESPLIEGUE CONTINUO (CD)   │
                                          │ • Generación de artefactos en /dist     │
                                          │ • Reglas de seguridad en Cloud Firestore│
                                          │ • Publicación en Firebase Hosting CDN   │
                                          │   ([https://huellitas-47cc5.web.app](https://huellitas-47cc5.web.app))     │
                                          └─────────────────────────────────────────┘