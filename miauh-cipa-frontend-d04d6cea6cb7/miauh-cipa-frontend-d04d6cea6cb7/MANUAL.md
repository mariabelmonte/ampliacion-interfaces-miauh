# 🐾 MIAUH - Manual de Usuario y Guía Técnica

Bienvenido al ecosistema **MIAUH**, la plataforma de gestión elite para protectoras de animales. Este documento proporciona una visión general de la arquitectura del software, el sistema de diseño y las guías para el mantenimiento y extensión del proyecto.

---

## 🚀 1. Arquitectura del Proyecto

La aplicación está construida sobre **Angular 21** y sigue un patrón de diseño modular, escalable y fuertemente tipado, estructurado en base a las convenciones de *Core / Features / Shared*.

### 📂 Estructura de Directorios
- `src/app/core/`: Contiene configuraciones (`config/endpoints.ts`), interceptores, guards, servicios base (`http.service.ts`, `auth.service.ts`) y modelos principales.
- `src/app/features/`: Módulos de funcionalidad de negocio (animales, adoptantes, calendario, dashboard, tratamientos, transacciones, login, gestion-usuarios, etc.).
- `src/app/shared/`: Componentes comunes, utilidades (utils), elementos de UI compartidos y modelos genéricos.
- `src/app/app.scss`: Sistema de diseño global y variables de tema (integración con Angular Material).

### ⚙️ Flujo de Datos
El proyecto utiliza **Signals** de Angular para la reactividad en los componentes y **Promises** para la comunicación con el backend a través del `HttpService`. Todo el flujo de datos está tipado mediante interfaces para garantizar la integridad de la información.

---

## 🎨 2. Sistema de Diseño (Design System)

MIAUH utiliza un sistema de diseño "Premium Blue" combinando **Angular Material 3** con las capacidades de layout de **Bootstrap 5**.

### Componentes Globales
- **Grid Responsivo**: Utiliza **Bootstrap 5** (clases como `.row`, `.col-md-X`, `.d-flex`) para el esqueleto y layout fluido, logrando construcciones rápidas y limpias.
- **Card Premium**: Todas las secciones principales están envueltas en `mat-card` de Angular Material con sombras sutiles y bordes redondeados (`--radius-xl`).
- **Tablas Elite**: Las tablas (`mat-table`) cuentan con efectos hover, cabeceras personalizadas y paginación integrada.
- **Calendarios**: Uso de `@fullcalendar/angular` para la gestión visual de citas, eventos y tareas del calendario.

### Modo Oscuro
El tema oscuro se activa automáticamente o mediante un selector de tema (manejado por el `ThemeService` en core). Utiliza variables de CSS para asegurar el contraste:
- `--bg-base`: Fondo profundo para la aplicación.
- `--text-main`: Contraste máximo para lectura facilitada.

---

## 🐶 3. Gestión de Animales

### Registro de Animales
Para añadir un animal, se utiliza el **Formulario Simplificado** que requiere:
- **Datos Básicos**: Nombre, capa, sexo y tamaño.
- **Trazabilidad**: Fecha de nacimiento, ingreso y número de chip.
- **Catálogos**: El sistema obliga a seleccionar una **Especie**, **Raza**, **Ubicación** y **Situación**.
- **Lógica PPP**: Si el animal es un perro, se habilitará el check de "Animal Potencialmente Peligroso".

### Servicios de Catálogo
Los listados de razas y ubicaciones se cargan de forma dinámica desde el servidor para que la base de datos sea siempre la fuente de verdad única.

---

## 👨‍💻 4. Guía para Desarrolladores

### Tipado y JSDoc
Todo nuevo desarrollo **DEBE** incluir:
1.  **Tipado fuerte**: Evitar el uso de `any`. Definir interfaces en `core/models` o en la subcarpeta `models` de cada módulo en *features/shared*.
2.  **Documentación JSDoc**: Cada método debe estar documentado para facilitar el uso del IDE (IntelliSense).

### Extensión de Endpoints
Para añadir una nueva ruta de API:
1.  Actualizar el objeto `RUTAS` en `core/config/endpoints.ts`.
2.  Añadir el método correspondiente en el servicio específico de la *feature* (ej. en `features/animales/services/`), con tipado de retorno explícito.

---

## 🏥 5. Salud y Tratamientos

### Modelo y Contrato de Datos (SaludPayload)
Para la estandarización de la comunicación entre el módulo de salud y la API, se utiliza un contrato JSON estricto (`SaludPayload` y modelo `Tratamiento`). Existen:
- Endpoints generales para listar todos los tratamientos (logs globales).
- Endpoints de filtrado por ID de animal para historiales de pacientes (`findById`).

---

## 🤝 6. Gestión de Adoptantes

### Formulario y Estructura de Datos
El sistema permite el alta y edición de adoptantes a través de su propio Modal.
- **Estructuras Anidadas**: Los datos se mapean desde el backend al `FormGroup`, utilizando un objeto anidado para `direccion` y un array dinámico para los `telefonos`.
- **Sincronización API**: La estructura enviada a través de `save` y recibida en `findById` sigue de manera estricta el modelo de datos exigido por el backend.

---

## 🔐 7. Autenticación y Usuarios

### Microservicio de Usuarios
MIAUH integra un microservicio dedicado a la gestión de usuarios y autenticación (gestionado desde `core/services/auth.service.ts` y features de login), asegurando el control de acceso a las funcionalidades críticas y al manejo de datos sensibles (JWT decodificación vía `jwt-decode`).

---

## 🛠️ 8. Solución de Problemas (Troubleshooting)

- **Problemas de Compilación**: Verificar que la versión de Node sea compatible con Angular 21, y que Vite/Vitest estén correctamente instalados como dependencias de desarrollo.
- **Estilos no aplicados**: Asegurarse de que el componente sea `standalone` y esté importando correctamente los módulos de Material o las clases globales.
- **Errores de Tipado / API**: Revisar la configuración en `core/config/endpoints.ts` y validar que el modelo en el frontend coincida exactamente con los DTOs de respuesta de los repositorios del backend.

---

*MIAUH v1.0 - Transformando la gestión de protectoras con tecnología elite.*
