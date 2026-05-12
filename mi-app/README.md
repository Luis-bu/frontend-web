# ProcessFlow — Frontend

Aplicación web para la gestión de procesos empresariales. Permite crear y administrar procesos por empresa, con sus actividades, gateways, arcos y roles de proceso.

---

## Tecnologías

| Tecnología | Versión |
|---|---|
| Angular (standalone, SSR) | 21.2 |
| TypeScript | 5.9 |
| RxJS | 7.8 |
| Angular Signals | incluido en Angular 21 |
| Express (servidor SSR) | 5.1 |
| Tailwind CSS | 4.2 (reset base) |
| Node.js / npm | npm 11 |

No se usa ninguna librería de componentes externa. El sistema de diseño es CSS propio con variables (paleta ámbar/naranja).

---

## Requisitos previos

- Node.js 20 o superior
- npm 11 o superior
- Backend Spring Boot corriendo en `http://localhost:8080`

---

## Instalación

```bash
cd mi-app
npm install
```

---

## Correr el frontend en desarrollo

```bash
npm start
# equivale a: ng serve
```

La app queda disponible en `http://localhost:4200`.  
El servidor tiene hot-reload: los cambios en archivos se reflejan sin reiniciar.

---

## Compilar para producción

```bash
npm run build
```

Los artefactos se generan en `dist/mi-app/`. Incluye bundle del cliente y servidor SSR.

Para ejecutar el servidor SSR compilado:

```bash
npm run serve:ssr:mi-app
```

---

## URL del backend esperada

Configurada en `src/environments/environment.ts`:

```ts
export const environment = {
  apiUrl: 'http://localhost:8080/api'
};
```

El backend debe tener CORS habilitado para `http://localhost:4200`.

---

## Rutas de la aplicación

| Ruta | Componente | Descripción |
|---|---|---|
| `/login` | `LoginComponent` | Pantalla de acceso |
| `/procesos` | `ListaProcesos` | Gestión de procesos por empresa |
| `/proceso/:id` | `DetallesProceso` | Detalle completo de un proceso |

---

## Funcionalidades implementadas

### Selector de empresa
- Carga automática de todas las empresas al entrar a `/procesos`
- Dropdown para cambiar de empresa; al seleccionar una nueva se recargan sus procesos
- La empresa con `id = 1` se preselecciona por defecto si existe

### Gestión de procesos (`/procesos`)
- Listado de procesos activos de la empresa seleccionada (excluye eliminados lógicamente)
- Búsqueda en tiempo real por nombre, descripción, categoría y estado
- Filtro por estado: Todos / Borrador / Publicado
- Vista de lista y vista de tablero (kanban)
  - En tablero: arrastre de tarjetas con el mouse en tiempo real
  - En tablero: conexiones visuales entre procesos (locales, sin persistencia en backend)
- Crear, editar y eliminar procesos
  - Eliminación con confirmación inline — sin `confirm()` del navegador
  - Eliminación lógica en el backend (`activo = false`); el frontend actualiza la lista localmente sin recargar
- Estados de carga con skeleton animado
- Estados vacíos con acción directa para crear el primer proceso
- Notificaciones toast (éxito / error) en cada operación CRUD

### Detalle de proceso (`/proceso/:id`)
- Carga paralela de actividades, gateways, arcos y roles con `forkJoin`
- Vista orbital: representación visual de actividades y gateways; clic en un nodo muestra su detalle
- Panel de información: estado, categoría, conteos de elementos
- Barra de progreso animada y skeleton completo de página durante la carga inicial

#### Actividades
- CRUD completo (crear, editar, eliminar)
- Campos: nombre, tipo, descripción, rol de proceso asignado
- El rol asignado aparece como etiqueta en la lista y en la vista orbital

#### Gateways
- CRUD completo
- Tipos: Exclusivo (XOR), Inclusivo (OR), Paralelo (AND)

#### Arcos
- CRUD completo
- Conectan actividades con actividades, actividades con gateways, o gateways con gateways
- Validación: no se permite seleccionar el mismo elemento como origen y destino

#### Roles de proceso
- CRUD completo
- Alcance empresa: los roles son compartidos por todos los procesos de la misma empresa
- En el detalle solo se muestran los roles usados por las actividades del proceso actual, o creados durante esa sesión
- Roles en uso: badge "En uso" y botón eliminar desactivado
- Si el backend rechaza la eliminación (rol asignado a actividades), el mensaje de error se muestra en pantalla

### UI / UX general
- Modo claro y oscuro con transición animada (preferencia guardada en `localStorage`)
- Notificaciones toast en la esquina superior derecha con animación de entrada y salida automática (3 s)
- Confirmación de eliminación inline en todos los recursos
- Diseño responsive, tipografía Inter, paleta ámbar/naranja

---

## Endpoints REST consumidos

### Empresas

| Método | Endpoint | Uso |
|---|---|---|
| `GET` | `/api/empresas` | Cargar selector de empresa |

### Procesos

| Método | Endpoint | Uso |
|---|---|---|
| `GET` | `/api/procesos/empresa/{empresaId}` | Listar procesos activos de la empresa |
| `GET` | `/api/procesos/{id}` | Obtener detalle de un proceso |
| `POST` | `/api/procesos` | Crear proceso |
| `PUT` | `/api/procesos/{id}` | Editar proceso |
| `DELETE` | `/api/procesos/{id}` | Eliminar proceso (soft-delete en backend) |

### Actividades

| Método | Endpoint | Uso |
|---|---|---|
| `GET` | `/api/actividades/proceso/{procesoId}` | Listar actividades del proceso |
| `POST` | `/api/actividades` | Crear actividad |
| `PUT` | `/api/actividades/{id}` | Editar actividad |
| `DELETE` | `/api/actividades/{id}` | Eliminar actividad |

### Gateways

| Método | Endpoint | Uso |
|---|---|---|
| `GET` | `/api/gateways/proceso/{procesoId}` | Listar gateways del proceso |
| `POST` | `/api/gateways` | Crear gateway |
| `PUT` | `/api/gateways/{id}` | Editar gateway |
| `DELETE` | `/api/gateways/{id}` | Eliminar gateway |

### Arcos

| Método | Endpoint | Uso |
|---|---|---|
| `GET` | `/api/arcos/proceso/{procesoId}` | Listar arcos del proceso |
| `POST` | `/api/arcos` | Crear arco |
| `PUT` | `/api/arcos/{id}` | Editar arco |
| `DELETE` | `/api/arcos/{id}` | Eliminar arco |

### Roles de proceso

| Método | Endpoint | Uso |
|---|---|---|
| `GET` | `/api/roles/empresa/{empresaId}` | Listar roles de la empresa |
| `POST` | `/api/roles` | Crear rol |
| `PUT` | `/api/roles/{id}` | Editar rol |
| `DELETE` | `/api/roles/{id}` | Eliminar rol |

---

## Cómo probar

### Selector de empresa

1. Asegúrate de que el backend esté corriendo con al menos una empresa en la base de datos.
2. Navega a `http://localhost:4200/procesos`.
3. El dropdown de empresa aparece en la cabecera del contenido con el nombre de la empresa activa.
4. Haz clic en el dropdown y selecciona otra empresa para ver sus procesos.

### CRUD de procesos

1. En `/procesos`, haz clic en **+ Nuevo proceso**.
2. Completa nombre, descripción, categoría y estado (Borrador o Publicado).
3. Guarda — aparece un toast de éxito y el proceso se añade a la lista sin recargar la página.
4. Haz clic en **Editar** en cualquier tarjeta para modificarlo.
5. Para eliminar: haz clic en **Eliminar** → aparece confirmación inline **¿Eliminar? / Sí / No** → confirma con **Sí**.
6. Usa el campo de búsqueda y el filtro de estado para filtrar la lista en tiempo real.
7. Cambia a vista **Tablero** con el selector de modo para arrastrar tarjetas con el mouse.

### Detalle de proceso, actividades, roles, gateways y arcos

1. Haz clic en cualquier tarjeta de proceso para navegar a `/proceso/:id`.
2. Espera el skeleton de carga; cuando termine verás el detalle completo.
3. **Vista orbital**: haz clic en cualquier nodo (actividad o gateway) para ver su información en el panel lateral.
4. **Actividades** → **+ Agregar**: completa nombre, tipo, descripción y elige un rol del desplegable → **Guardar**.
5. **Gateways** → **+ Agregar**: elige el tipo → **Guardar**.
6. **Arcos** → **+ Agregar**: selecciona origen y destino (actividad o gateway) — el formulario bloquea el guardado si origen y destino son el mismo elemento → **Guardar**.
7. **Roles de proceso** → **+ Agregar**: completa nombre y descripción → **Guardar**. El rol creado aparece de inmediato y queda disponible en el selector de las actividades.
8. Para eliminar cualquier elemento: **Eliminar** → confirmación inline → **Sí**. Un toast confirma el resultado.

### Ejecutar el build

```bash
npm run build
```

El build termina correctamente cuando aparece `Application bundle generation complete.`  
Las advertencias de presupuesto de tamaño de bundle son esperadas y no bloquean la compilación.

---

## Estructura del proyecto

```
mi-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   ├── lista-procesos/
│   │   │   ├── detalles-proceso/
│   │   │   └── toast/
│   │   ├── models/
│   │   │   ├── actividad.model.ts
│   │   │   ├── arco.model.ts
│   │   │   ├── empresa.model.ts
│   │   │   ├── gateway.model.ts
│   │   │   ├── proceso.model.ts
│   │   │   └── rol-proceso.model.ts
│   │   ├── services/
│   │   │   ├── actividad.service.ts
│   │   │   ├── arco.service.ts
│   │   │   ├── empresa.service.ts
│   │   │   ├── gateway.service.ts
│   │   │   ├── proceso.service.ts
│   │   │   ├── rol-proceso.service.ts
│   │   │   └── toast.service.ts
│   │   ├── app.routes.ts
│   │   ├── app.config.ts
│   │   └── app.ts
│   ├── environments/
│   │   └── environment.ts
│   ├── styles.css
│   └── index.html
└── package.json
```
