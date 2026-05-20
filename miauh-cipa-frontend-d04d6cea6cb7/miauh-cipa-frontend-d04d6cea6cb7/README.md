# 🐾 MIAUH - Sistema de Gestión para Protectoras de Animales

Bienvenido a **MIAUH** (Gestión de Animales), un frontend construido en **Angular 21** para modernizar y facilitar la administración de protectoras de animales. Este proyecto se comunica con un conjunto de microservicios robustos en el backend para gestionar desde inventarios de animales hasta historiales médicos y procesos de adopción.

## 🌟 Características Principales
- **Gestión de Animales**: CRUD completo de perros, gatos y otras especies, incluyendo raza, especie, capas, y marcadores PPP.
- **Salud y Tratamientos**: Historial clínico y seguimiento de tratamientos (`SaludPayload`, `Tratamiento`) por paciente.
- **Gestión de Adoptantes**: Control de solicitantes con estructuración de datos avanzada (dirección, teléfonos).
- **Autenticación y Usuarios**: Integración con microservicio independiente para la seguridad y control de acceso.
- **Diseño Premium**: Interfaz moderna, basada en Material 3, con un tema oscuro (Premium Blue) y diseño altamente responsivo.

## 🛠️ Tecnologías Utilizadas
- **Framework:** Angular 21
- **Estilos:** Angular Material 3, SCSS, Sistema CSS Grid/Flexbox
- **Estado y Reactividad:** Angular Signals
- **Pruebas:** Vitest (Unitarias)

## 🚀 Instalación y Ejecución Local

1. Clona el repositorio e instala las dependencias:
   ```bash
   npm install
   ```

2. Inicia el servidor de desarrollo local:
   ```bash
   npm run start
   ```
   *O alternativamente usa `ng serve`.*

3. Navega a `http://localhost:4200/` en tu navegador. La aplicación se recargará automáticamente ante cualquier cambio en el código fuente.

## 📖 Documentación

Para una guía detallada sobre la arquitectura, sistema de diseño y flujos de trabajo, consulta nuestro [MANUAL.md](./MANUAL.md).

## 🏗️ Construcción para Producción

Para compilar el proyecto, ejecuta:
```bash
npm run build
```
Los artefactos generados se guardarán en el directorio `dist/`.

## 🧪 Pruebas

- **Unitarias:** Ejecuta `npm run test` para correr las pruebas con Vitest.
