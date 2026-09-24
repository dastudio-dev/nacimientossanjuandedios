# Nacimientos San Juan de Dios

Registro de nacimientos de la **Casa Hospital San Juan de Dios** (Ramos Mejía / Castelar, Argentina).

Web de una sola página (`index.html`) con Tailwind, Chart.js y Firebase (Auth + Firestore), basada en
[nacimientos2](https://github.com/diegoastein/nacimientos2) (formulario de ingreso y edición) y
[auditorianacimientos](https://github.com/diegoastein/auditorianacimientos) (consultas, exportación y dashboard).

- **Ingreso**: alta de pacientes (datos del paciente, maternos, grupo/Rh, PCD/PCI, antecedentes, parto, RN, diagnóstico, notas).
- **Consultas & Reportes**: filtros avanzados, edición de pacientes y exportación a CSV (compatible con Excel en español).
- **Dashboard Estadístico**: KPIs y gráficos por año / mes.

## Puesta en marcha de Firebase (una sola vez)

1. Entrar a <https://console.firebase.google.com> → **Agregar proyecto** (ej. `nacimientos-sjd`). Google Analytics no hace falta.
2. **Authentication** → Comenzar → **Correo electrónico/contraseña** → Habilitar.
3. **Authentication → Configuración → Dominios autorizados** → agregar `diegoastein.github.io`.
4. **Firestore Database** → Crear base de datos → ubicación `southamerica-east1` (São Paulo) → modo producción.
5. **Firestore → Reglas** → pegar el contenido de [`firestore.rules`](firestore.rules) → Publicar.
6. **Configuración del proyecto** (⚙️) → Tus apps → ícono Web `</>` → registrar la app → copiar el objeto
   `firebaseConfig` y pegarlo en `index.html` (buscar `COMPLETAR`).

## Usuarios autorizados

El registro es abierto, pero para ver o cargar pacientes una cuenta tiene que:

1. **Verificar su email** (la app envía el link al registrarse).
2. **Estar en la lista de autorizados**: en Firestore, colección `autorizados`, crear un documento cuyo
   **ID sea el email en minúsculas** (ej. `medica@hospital.org.ar`). Los campos son opcionales
   (sugerido: `nombre`, `rol`).

Para quitar el acceso a alguien, borrar su documento de `autorizados`.
Desde la app no se pueden borrar pacientes (las reglas lo impiden).
