# Documentación: controladorCiudadanos

**Versión:** 1.0  
**Tiempo de lectura:** ~30 minutos  

---

## 📋 Tabla de Contenidos

1. [¿Qué es controladorCiudadanos?](#qué-es-controladorciudadanos)
2. [Conceptos Fundamentales](#conceptos-fundamentales)
3. [Estructura de la Clase](#estructura-de-la-clase)
4. [El Ciclo de Procesamiento (procesarTurno)](#el-ciclo-de-procesamiento-procesarturno)
5. [Patrones de Diseño](#patrones-de-diseño)
6. [Guía de Métodos](#guía-de-métodos)
7. [Ejemplos Prácticos](#ejemplos-prácticos)
8. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## ¿Qué es controladorCiudadanos?

### Propósito General

`controladorCiudadanos` es el **corazón de la simulación demográfica** en el juego. Controla:

- **Nacimientos** (crecimiento natural de la población)
- **Emigración** (ciudadanos que abandonan la ciudad)
- **Inmigración** (nuevas personas llegando)
- **Asignación de vivienda** (dónde viven los ciudadanos)
- **Asignación de empleos** (dónde trabajan)
- **Cálculo de felicidad** (satisfacción de cada ciudadano)

### ¿Por qué es importante?

Cuando ocurre un turno en el juego, **nada cambia automáticamente**. El controlador es responsable de:

```
┌─────────────────────────────────────────┐
│ Inicio del turno                        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ controladorCiudadanos.procesarTurno()   │
│ (aquí ocurre toda la magia)             │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ Los ciudadanos se mueven, nacen o se van│
│ La felicidad se recalcula               │
│ El estado de la ciudad cambia           │
└─────────────────────────────────────────┘
```

---

## Conceptos Fundamentales

### 1. CONFIG_DEFECTO: Los "números mágicos"

Toda la simulación se basa en valores configurables. Estos están en `CONFIG_DEFECTO` (congelado con `Object.freeze()`):

```javascript
const CONFIG_DEFECTO = Object.freeze({
    // Crecimiento natural
    minCrecimiento: 1,              // Mínimo ciudadanos creados por turno
    maxCrecimiento: 3,              // Máximo ciudadanos creados por turno
    umbralFelicidadCrecimiento: 60, // Felicidad mínima para que nazcan
    
    // Emigración
    umbralFelicidadEmigrar: 10,           // Ciudadanos con felicidad < 10 se van
    maxTurnosDesempleado: 5,              // Max turnos sin empleo antes de emigrar
    maxTurnosSinVivienda: 3,              // Max turnos sin vivienda antes de emigrar
    
    // Inmigración
    umbralFelicidadInmigrar: 80,          // Necesario 80 de felicidad promedio
    dineroMinimoInmigracion: 50000,       // Y 50k en tesorería (dinero)
    capacidadResidualLibreMin: 0.10,      // Y 10% viviendas libres
    
    // Felicidad (la fórmula)
    alpha: 0.3,                      // Velocidad de convergencia (0-1) 
    BASE_FELICIDAD: 40,              // Base
    BONO_VIVIENDA: 20,               // + 20 si tiene casa
    PENALIZACION_VIVIENDA: -25,      // - 25 si no tiene
    BONO_EMPLEO: 15,                 // + 15 si tiene trabajo
    PENALIZACION_EMPLEO: -15         // - 15 si no tiene
});
```

**¿Por qué `Object.freeze()`?**  
Hace el objeto **inmutable**. Una vez creado, no se puede cambiar. Esto evita bugs donde alguien accidentalmente modifique valores.

### 2. Los Maps: Convertidores de Subtipo → Tipo

El mapa tiene strings como "R1", "C1", etc. Pero estos strings necesitan información (capacidad, empleos, etc.).

Los Maps hacen la **conversión**:

```javascript
const SUBTIPOS_RESIDENCIAL = new Map([
    ["R1", TipoResidencial.CASA],           // "R1" (string) → Objeto CASA
    ["R2", TipoResidencial.APARTAMENTO]     // "R2" (string) → Objeto APARTAMENTO
]);

// Así: cuando ves "R1" en el mapa puedes hacer:
const tipo = SUBTIPOS_RESIDENCIAL.get("R1");
// Ahora 'tipo' tiene: { nombre: "CASA", capacidad: 5, ... }
```

**¿Por qué es útil?**

Porque el mapa es un array 2D de strings (eficiente), pero necesitamos información. Los Maps conectan el string con los datos reales.

### 3. El Registro de Edificios: La Verdadera Magia

Este es el **concepto más importante** de toda la clase.

#### El Problema

¿Qué pasaría si cada turno **creáramos nuevas instancias** de edificios?

```javascript
// TURNO 1: Construyes casa en (5,10)
const casa = new EdificioResidencial(...);  // Nueva instancia
ciudad.agregarCiudadano(ciudadano1);        // Lo asignas
console.log(casa.residentes.length);        // 1 ✓

// TURNO 2: Vuelves a la misma celda
const casa2 = new EdificioResidencial(...); // ⚠️ NUEVA instancia
console.log(casa2.residentes.length);       // 0 ❌ Los residentes desaparecieron!
```

Los residentes no persisten entre turnos. **Caos total.**

#### La Solución: #registroEdificios

Un Map que **cachea** (almacena) las instancias para reutilizarlas:

```javascript
#registroEdificios = new Map();  // key: "y-x", value: EdificioResidencial

// TURNO 1:
const clave = "5-10";
const edificio = this._obtenerOCrearEdificio(clave, "R1", 
    () => new EdificioResidencial(...)
);
// Si NO existe → crea y guarda
// this.#registroEdificios.set("5-10", edificio);

// TURNO 2:
const edificio2 = this._obtenerOCrearEdificio(clave, "R1", 
    () => new EdificioResidencial(...)
);
// Si EXISTE y el subtipo es igual → devuelve LA MISMA INSTANCIA
// Los residentes persisten ✓
```

**Trazado completo de 2 turnos:**

```
┌─────────────────────────────────────────────┐
│ TURNO 1                                     │
├─────────────────────────────────────────────┤
│ 1. Celda (5,10) = "R1" (CASA)              │
│ 2. NO existe en registro                    │
│ 3. Crea: new EdificioResidencial()         │
│ 4. Guarda: registro["5-10"] = instancia    │
│ 5. Asigna ciudadano1                       │
│ 6. edificio.residentes = [ciudadano1]      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ TURNO 2                                     │
├─────────────────────────────────────────────┤
│ 1. Celda (5,10) = "R1" (sigue siendo CASA) │
│ 2. ¡EXISTE en registro!                     │
│ 3. Devuelve LA MISMA INSTANCIA             │
│ 4. Asigna ciudadano2                       │
│ 5. edificio.residentes = [c1, c2] ✓       │
│    (ciudadano1 sigue ahí)                  │
└─────────────────────────────────────────────┘
```

**Conclusión:** Sin este patrón, la persistencia no funcionaría. **Es el patrón más importante de todo el código.**

### 4. Convergencia Suave: No Cambios Bruscos

La felicidad NO cambia de 50 a 100 en un turno. Cambia **gradualmente**.

La fórmula usa un factor **alpha** (α):

```javascript
H_nueva = H_actual + α × (H_objetivo - H_actual)
```

Con α = 0.3 (por defecto):

```
Turno 1: 50 + 0.3 × (100 - 50) = 50 + 15 = 65
Turno 2: 65 + 0.3 × (100 - 65) = 65 + 10.5 ≈ 76
Turno 3: 76 + 0.3 × (100 - 76) = 76 + 7.2 ≈ 83
Turno 4: 83 + 0.3 × (100 - 83) = 83 + 5.1 ≈ 88
```

La felicidad **converge lentamente** a 100. Nunca llega exactamente (es exponencial), pero se acerca cada vez más.

**¿Por qué?** Porque es **realista**. Las emociones no cambian de la noche a la mañana. Convergen suavemente.

---

## Estructura de la Clase

### Propiedades Privadas (#)

```javascript
export class controladorCiudadanos {
    #juego;                  // Referencia al Juego (necesario para acceder a ciudad)
    #config;                 // Configuración (puede ser la default o custom)
    #registroEdificios;      // Map que cachea instancias de edificios
    #contadorId;             // Contador de IDs para generar IDs únicos de ciudadanos
    #turnosDineroNegativo;   // Contador para detectar crisis económica
    #ultimoEventoMigracion;  // Resumen del último turno (para mostrar en UI)
}
```

**¿Por qué privadas (#)?**

Porque son detalles internos. Los compañeros no necesitan acceder a `#registroEdificios` directamente. Solo usan `procesarTurno()`.

### Constructor

```javascript
constructor(juego, config = {}) {
    // 1. Valida que reciba un Juego válido
    if (!(juego instanceof Juego)) {
        throw new Error("SistemaCiudadanos requiere una instancia válida de Juego");
    }
    
    // 2. Guarda referencias
    this.#juego = juego;
    this.#config = { ...CONFIG_DEFECTO, ...config };  // Merge: default + custom
    
    // 3. Initializa estado privado
    this.#registroEdificios = new Map();
    this.#contadorId = this._obtenerMaxIdCiudadano();  // Busca el ID máximo existente
    this.#turnosDineroNegativo = 0;
    this.#ultimoEventoMigracion = { /* ... */ };
}
```

**Uso esperado:**

```javascript
// Crear con config default
const ctrl = new controladorCiudadanos(juego);

// O customizar valores
const ctrl = new controladorCiudadanos(juego, {
    minCrecimiento: 2,
    maxCrecimiento: 5,
    umbralFelicidadCrecimiento: 50
});
```

---

## El Ciclo de Procesamiento: procesarTurno

Este es el **método principal**. Se llama una vez por turno.

### Orden de Ejecución (CRÍTICO)

```javascript
procesarTurno() {
    1. _procesarEmigracion(...)      // Los infelices se van
    2. _crearCiudadanos(...)         // Nacen nuevos ciudadanos
    3. _procesarInmigracion(...)     // Llegan inmigrantes
    4. _asignarViviendas(...)        // Se asignan casas
    5. _asignarEmpleos(...)          // Se asignan trabajos
    6. _actualizarFelicidades(...)   // Se recalcula felicidad
}
```

**¿Por qué este orden y no otro?**

Porque **la lógica debe seguir el ciclo de vida natural**:

#### 1️⃣ Emigración PRIMERO

Si no emigramos primero y hacemos asignaciones después, tendríamos:
- Ciudadanos infelices con vivienda asignada
- Ciudadanos desempleados largo tiempo con empleo asignado
- Lo cual es inconsistente

**Orden correcto:** Quitar los que se van → luego asignar los que quedan.

#### 2️⃣ Crecimiento SEGUNDO

Necesitamos espacio residencial y laboral. Si emiazramos primero, hay espacio.

#### 3️⃣ Inmigración TERCERO

Los inmigrantes necesitan espacio también. Viene después del crecimiento porque ambos usan el mismo espacio.

#### 4️⃣ Asignación CUARTO

Ahora todos los ciudadanos (nuevos, inmigrantes, antiguos) necesitan vivienda y trabajo.

#### 5️⃣ Felicidad QUINTO

Con el estado definitivo de vivienda/empleo, recalculamos felicidad.

### Retorno: Resumen de Eventos

```javascript
return {
    emigracion: { 
        total: 2,
        infelicidad: 1,
        desempleo: 0,
        sinVivienda: 1,
        crisis: 0,
        mensajes: ["❌ 1 ciudadano emigró por infelicidad", ...]
    },
    inmigracion: {
        total: 1,
        mensajes: ["✅ 1 nuevo ciudadano inmigró"]
    },
    mensajes: [...]  // Todos los mensajes combinados
};
```

Este resumen se usa en la UI para mostrar eventos.

---

## Patrones de Diseño

### PATRÓN 1: Reutilización de Instancias

**Donde:** `_obtenerOCrearEdificio(clave, subtipo, factory)`

```javascript
_obtenerOCrearEdificio(clave, subtipo, factory) {
    // 1. ¿Existe la instancia?
    const existente = this.#registroEdificios.get(clave);
    
    // 2. Si existe Y el tipo NO cambió → reutiliza
    if (existente && existente.subtipo === subtipo)
        return existente;
    
    // 3. Si no existe O cambió tipo → nueva instancia
    const nuevo = factory();
    this.#registroEdificios.set(clave, nuevo);
    return nuevo;
}
```

**¿Cuándo se aplica?**
- Al buscar vivienda disponible
- Al buscar empleo disponible

**Beneficio:** Los ciudadanos persisten en sus viviendas/empleos entre turnos.

### PATRÓN 2: Convergencia Suave

**Donde:** `_actualizarFelicidades(...)`

```javascript
const hNueva = ciudadano.felicidad + 
               alpha * (hObjetivo - ciudadano.felicidad);
```

**Beneficio:** Los cambios son realistas y graduales.

### PATRÓN 3: Guardia Defensiva

**Donde:** Constructor

```javascript
if (!(juego instanceof Juego)) {
    throw new Error("...");
}
```

**Beneficio:** Falla rápido y claro si recibe datos inválidos.

### PATRÓN 4: Early Exit

**Donde:** `_asignarViviendas(...)`

```javascript
for (const ciudadano of sinVivienda) {
    const edificio = this._buscarEdificioResidencialConEspacio(...);
    if (!edificio) break;  // ← Detiene si no hay espacio
    edificio.agregarResidente(ciudadano);
}
```

**Beneficio:** Si no hay espacio, algunos ciudadanos quedan sin vivienda (esperarán al siguiente turno o emigrarán).

### PATRÓN 5: Iteración 2D

**Donde:** `_buscarEdificioResidencialConEspacio(...)`

```javascript
for (let y = 0; y < celdas.length; y++) {
    for (let x = 0; x < celdas[y].length; x++) {
        const subtipo = celdas[y][x];
        // Procesar celda...
    }
}
```

**Beneficio:** Recorre el mapa completo en orden.

---

## Guía de Métodos

### Métodos Públicos (API)

#### `procesarTurno()`
**Responsabilidad:** Ejecutar toda la lógica del turno.

**Entrada:** Ninguna (usa estado privado).

**Salida:** Objeto con resumen de emigración/inmigración.

**Llamada por:** El controlador de juego (en cada turno).

---

#### `obtenerEstadisticas()`
**Responsabilidad:** Retornar estadísticas de población para la UI.

**Entrada:** Ninguna.

**Salida:**
```javascript
{
    total: 45,              // Total ciudadanos
    empleados: 30,          // Empleados
    desempleados: 15,       // Desempleados
    felicidadPromedio: 72   // Promedio felicidad
}
```

**Llamada por:** UI (para mostrar números).

---

#### `obtenerResumenMigracionTurno()`
**Responsabilidad:** Retornar el último resumen (útil para UI asincrónica).

**Entrada:** Ninguna.

**Salida:** Copia del resumen anterior.

---

#### `obtenerFelicidadPromedio(ciudadanos)`
**Responsabilidad:** Calcular el promedio de felicidad.

**Entrada:** Array de ciudadanos.

**Salida:** Número (0-100).

**Fórmula:** `sum(felicidades) / count`

---

### Métodos Internos (Privados)

#### `_crearCiudadanos(celdas, ciudad)`
**¿Qué hace?** Crea nuevos ciudadanos (nacimientos naturales).

**Condiciones para crear:**
1. Hay capacidad residencial libre
2. Si `requerirEmpleoDisponible=true`: hay empleos disponibles
3. Si la ciudad NO está vacía: felicidad promedio > 60

**Cantidad:** Entre `minCrecimiento` y `maxCrecimiento`.

**¿Por qué estas condiciones?**
- Sin espacio → no caben
- Sin empleo → no tienen dónde trabajar (opcional según config)
- Infelicidad → no se reproducen

---

#### `_procesarEmigracion(celdas, ciudad)`
**¿Qué hace?** Elimina ciudadanos por varias razones.

**4 Razones de emigración:**

| Razón | Condición | Parámetro |
|-------|-----------|-----------|
| Infelicidad | Felicidad < 10 | `umbralFelicidadEmigrar` |
| Desempleo | Turno sin empleo > 5 | `maxTurnosDesempleado` |
| Sin vivienda | Turno sin vivienda > 3 | `maxTurnosSinVivienda` |
| Crisis | Dinero negativo 3+ turnos | `dineroNegativoTurnosMax` |

**¿Por qué 4 razones?** Para que la población sea dinámica. Si solo fuera infelicidad, bastaría tener un buen sistema de salud y todo sería feliz.

**Retorno:**
```javascript
{
    total: 3,
    infelicidad: 1,
    desempleo: 0,
    sinVivienda: 2,
    crisis: 0,
    mensajes: [...]
}
```

---

#### `_crearCiudadanos(celdas, ciudad)`
**Ya explicado arriba.**

---

#### `_procesarInmigracion(celdas, ciudad)`
**¿Qué hace?** Agrega nuevos ciudadanos (inmigración).

**3 Condiciones (TODAS deben cumplirse):**

| Condición | Umbral | Parámetro |
|-----------|--------|-----------|
| Felicidad promedio | ≥ 80 | `umbralFelicidadInmigrar` |
| Dinero tesorería | ≥ 50000 | `dineroMinimoInmigracion` |
| Capacidad libre | ≥ 10% | `capacidadResidualLibreMin` |

**¿Por qué tan restrictivo?** Porque inmigrar es un **logro**. Indica que la ciudad es atractiva.

**Felicidad de inmigrantes:** Empiezan con 60 (menos que los nacidos con 100, porque tienen que adaptarse).

---

#### `_asignarViviendas(celdas, ciudad)`
**¿Qué hace?** Para cada ciudadano sin vivienda, busca un edificio residencial con espacio.

**Algoritmo:**
```
Para cada ciudadano sin vivienda:
    1. Busca edificio residencial con espacio
    2. Si NO hay → detiene (early exit)
    3. Si hay → asigna ciudadano a edificio
```

**Resultado:** Algunos ciudadanos pueden quedarse sin vivienda si no hay espacio. Emigrarán en el siguiente turno.

---

#### `_asignarEmpleos(celdas, ciudad)`
**¿Qué hace?** Para cada ciudadano desempleado, busca un edificio comercial/industrial con empleo.

**Idéntico a `_asignarViviendas`**, pero con edificios productivos.

---

#### `_actualizarFelicidades(celdas, ciudad)`
**¿Qué hace?** Recalcula la felicidad de cada ciudadano.

**Proceso:**
```
Para cada ciudadano:
    1. Incrementar contador de turnos desempleado (si aplicable)
    2. Incrementar contador de turnos sin vivienda (si aplicable)
    3. Calcular felicidad objetivo (H_obj)
    4. Aplicar convergencia: H_nueva = H_actual + α × (H_obj - H_actual)
```

---

#### `_calcularFelicidadObjetivo(ciudadano, numServicios, numParques, economia)`
**¿Qué hace?** Calcula la "meta" de felicidad (sin convergencia).

**Fórmula:**

```
H_obj = 40 (BASE_FELICIDAD)
      + (20 si vivienda, -25 si no)
      + (15 si empleo, -15 si no)
      + (10 × min(servicios, 3))
      + (5 × min(parques, 6))
      + (-20 por cada recurso faltante: agua, electricidad)

Luego: H_obj = clamp(0, 100, H_obj)  // Máximo 100, mínimo 0
```

**Desglose:**
- **Base:** Empezar en 40 (neutral).
- **+/-20 Vivienda:** Gran impacto. Tener casa es importante.
- **+/-15 Empleo:** Importante, pero menos que vivienda.
- **+10 Servicios:** Hasta 3 (máximo 30 puntos). Hospital, policía, bomberos.
- **+5 Parques:** Hasta 6 (máximo 30 puntos). Espacio verde.
- **-20 Recursos:** Si falta agua O electricidad.

**Ejemplo:**
```
Ciudadano sin vivienda, sin empleo, 2 servicios, 1 parque, agua OK:
H_obj = 40 - 25 - 15 + (10 × 2) + (5 × 1) + 0
      = 40 - 25 - 15 + 20 + 5
      = 25

Este ciudadano querrá emigrar (felicidad objetivo baja).
En el próximo turno, con convergencia (α=0.3):
H_nueva = 50 + 0.3 × (25 - 50) = 50 - 7.5 ≈ 42
```

---

#### `_calcularCapacidadResidencialLibre(celdas, ciudad)`
**¿Qué hace?** Calcula cuánto espacio residencial queda.

**Fórmula:**
```
capacidadTotal = sum(tipo.capacidad para cada celda residencial)
capacidadLibre = capacidadTotal - ciudadanos.length
```

---

#### `_calcularVacantesLaboralesReales(celdas, ciudad)`
**¿Qué hace?** Calcula cuántos empleos quedan disponibles.

**Fórmula:**
```
empleosTotales = sum(empleos de cada edificio comercial/industrial)
empleadosActuales = ciudad.obtenerTotalEmpleados()
vacantes = empleosTotales - empleadosActuales
desempleados = ciudad.obtenerTotalDesempleados()
vacantesReales = max(0, vacantes - desempleados)
```

**¿Por qué restar desempleados?** Para no contar el mismo empleo dos veces. Si hay 10 vacantes y 8 desempleados, solo 2 nuevos ciudadanos pueden nacer.

---

#### `_buscarEdificioResidencialConEspacio(celdas)`
**¿Qué hace?** Recorre el mapa y devuelve el primer edificio residencial con espacio.

**Usa:** `_obtenerOCrearEdificio()` para reutilizar instancias.

**Retorno:** EdificioResidencial o null si no hay.

---

#### `_buscarEdificioProductivoConEspacio(celdas)`
**¿Qué hace?** Idéntico pero busca comercial/industrial.

---

#### `_obtenerOCrearEdificio(clave, subtipo, factory)`
**Ya explicado en "PATRÓN 1".**

---

#### `_contarCeldas(celdas, subtiposSet)`
**¿Qué hace?** Cuenta cuántas celdas coinciden con un Set de subtipos.

**Uso:** Contar hospitales, parques, policías, etc.

---

#### `_removerCiudadano(ciudad, ciudadano)`
**¿Qué hace?** Elimina un ciudadano limpiamente.

**Proceso:**
```
1. Si tiene vivienda → removerlo del edificio
2. Si tiene empleo → removerlo del edificio
3. Removerlo de ciudad.ciudadanos
```

**¿Por qué no solo borrar?** Porque si la casa guarda una lista de residentes, debemos limpiarlo de ahí. Sino, la casa tendría un residente "fantasma".

---

#### `_hayCrisisEconomica(economia)`
**¿Qué hace?** Detecta si la economía está en crisis (dinero negativo 3+ turnos).

**Contador:** `#turnosDineroNegativo`

**Retorno:** boolean.

---

### Métodos Utilidad

#### `_obtenerMuestraAleatoria(lista, cantidad)`
**¿Qué hace?** Retorna `cantidad` elementos aleatorios de `lista` sin repetir.

**Algoritmo:** Fisher-Yates shuffle.

---

#### `_aleatorioEntre(min, max)`
**¿Qué hace?** Retorna número entero aleatorio entre min y max (ambos incluidos).

---

#### `_obtenerMaxIdCiudadano()`
**¿Qué hace?** Busca el ID máximo existente para iniciar el contador.

**¿Por qué?** Para que los nuevos ciudadanos tengan IDs únicos.

---

## Ejemplos Prácticos

### Ejemplo 1: Turno Normal

```
ESTADO INICIAL:
- 30 ciudadanos, felicidad promedio 75
- 5 sin vivienda, 3 desempleados
- Dinero tesorería: 100,000
- 2 casas vacías, 5 empleos vacantes

PROCESARTURNO():

1. _procesarEmigracion():
   - 1 ciudadano con felicidad 5 emigra (infelicidad)
   - Total 29 ciudadanos

2. _crearCiudadanos():
   - Felicidad promedio 75 > 60 ✓
   - Hay espacio ✓
   - Crecimiento = random(1,3) = 2
   - Crean ciudadanos c-31, c-32
   - Total 31 ciudadanos

3. _procesarInmigracion():
   - Felicidad promedio 75 < 80 ✗
   - NO hay inmigración (falta 5 puntos)

4. _asignarViviendas():
   - Ciudadanos sin vivienda: 5 + 2 (nuevos) = 7
   - Casas disponibles: 2
   - Asignan 2 ciudadanos
   - Quedan 5 sin vivienda (esperarán/emigrarán)

5. _asignarEmpleos():
   - Desempleados: 3 + 2 (nuevos si no tienen) = hasta 5
   - Empleos disponibles: 5
   - Asignan todos

6. _actualizarFelicidades():
   - Todos recalculan felicidad
   - Convergencia lenta hacia objetivo

RESULTADO:
- 31 ciudadanos, 5 sin vivienda
- Próximo turno: 5 sin vivienda emigrarán si no hay espacio
```

### Ejemplo 2: Crisis Económica

```
ESTADO:
- Dinero: -10,000 (tercera vuelta consecutiva negativa)
- 50 ciudadanos

CRISIS DETECTADA:
_hayCrisisEconomica() → true
_procesarEmigracion() corre lógica de crisis:
- Calcula: 25% de 50 = 12.5 → 12 ciudadanos
- Selecciona 12 ciudadanos aleatorios
- Los emigran

RESULTADO:
- 38 ciudadanos (12 se fueron)
- El contador de turnos negativos se resetea si el dinero mejora
```

### Ejemplo 3: Cálculo de Felicidad

```
CIUDADANO: María, id: c-5

ESTADO ACTUAL:
- Felicidad: 50
- Tiene vivienda: Sí
- Tiene empleo: No
- Servicios en ciudad: 2
- Parques en ciudad: 1
- Agua: 50 (OK)
- Electricidad: 0 (FALTA)

CALCULAR H_OBJ:
H_obj = 40 (base)
      + 20 (vivienda)
      - 15 (sin empleo)
      + (10 × min(2, 3)) = 20
      + (5 × min(1, 6)) = 5
      + 0 (agua OK)
      - 20 (electricidad falta)
      = 40 + 20 - 15 + 20 + 5 - 20
      = 50

CONVERGENCIA (α = 0.3):
H_nueva = 50 + 0.3 × (50 - 50)
        = 50 + 0
        = 50

María se mantiene en 50 porque su objetivo también es 50.

SI SIGUIENTE TURNO:
- Consiguen electricidad
- Entonces H_obj = 40 + 20 - 15 + 20 + 5 + 0 = 70

CONVERGENCIA:
H_nueva = 50 + 0.3 × (70 - 50)
        = 50 + 6
        = 56

María sube a 56 (0.3 de la distancia al objetivo).
Cada turno subirá más (56 → 61 → 64 → ...).
```

---

## Preguntas Frecuentes

### P: ¿Qué pasa si no hay espacio residencial?
**R:** Las nuevas personas no nacen. Los sin vivienda emigran en el siguiente turno (después de 3 turnos sin casa).

---

### P: ¿Qué pasa si no hay empleos?
**R:** Depende de `requerirEmpleoDisponible`:
- Si es `true`: no nacen nuevos ciudadanos si no hay empleo.
- Si es `false`: nacen igual, quedan desempleados, y emigran después de 5 turnos.

---

### P: ¿Cómo persisten los ciudadanos en sus viviendas?
**R:** Por el patrón de reutilización. El mismo objeto EdificioResidencial se reutiliza cada turno (gracias a `#registroEdificios`). Sus arrays internos persisten.

---

### P: ¿Por qué la felicidad converge lentamente?
**R:** Por realismo. Las emociones no cambian de la noche a la mañana. El factor α (0.3) es un balance entre velocidad y realismo.

---

### P: ¿Qué pasa si cambio un valor en CONFIG_DEFECTO?
**R:** No pasa nada porque está congelado con `Object.freeze()`. Si quieres cambiar, pasa un config personalizado al constructor:
```javascript
const ctrl = new controladorCiudadanos(juego, {
    alpha: 0.5,  // Más rápido
    maxCrecimiento: 5
});
```

---

### P: ¿Por qué 4 razones de emigración?
**R:** Para diversidad demográfica:
1. **Infelicidad** → Motivación emocional.
2. **Desempleo** → Motivación económica.
3. **Sin vivienda** → Necesidad básica.
4. **Crisis** → Fuerza mayor (calamidad económica).

Sin estas, la simulación sería poco realista.

---

### P: ¿Qué pasa si el dinero es negativo?
**R:** Se cuenta un turno hacia crisis. Si ocurre 3 turnos consecutivos, el 25% de la población emigra.

---

### P: ¿Se pueden crear CiudadanosSin asignación de vivienda/empleo?
**R:** Sí, para la ciudad inicial (caso borde HU-13). Luego, en `_crearCiudadanos()`, se puede habilitar con `requerirEmpleoDisponible: false` para crear desempleados.

---

### P: ¿Cómo agrego más razones de emigración?
**R:** Modifica `_procesarEmigracion()`. Por ejemplo:
```javascript
// Agregar: emigración por edad
const ancianos = ciudad.ciudadanos.filter(c => c.edad > 80);
for (const ciudadano of ancianos) {
    this._removerCiudadano(ciudad, ciudadano);
    resultado.ancianos++;
}
```

---

### P: ¿Cómo cambio la fórmula de felicidad?
**R:** Modifica `_calcularFelicidadObjetivo()`. Por ejemplo:
```javascript
// Agregar factor: educación
hObj += ciudadano.educacion ? 10 : -5;
```

---

## Resumen Conceptual

Si alguien te pregunta: **"¿Qué hace controladorCiudadanos?"**

**Respuesta corta (1 línea):**
> Simula la dinámica demográfica urbana: nacimientos, emigración, inmigración, asignación de vivienda/empleo, y cálculo de felicidad.

**Respuesta media (3 líneas):**
> Controla el ciclo de vida de los ciudadanos. Cada turno: elimina infelices/desempleados, crea nuevos, atrae inmigrantes, asigna casas y trabajos, y actualiza la felicidad de todos. Todo persiste gracias a un registro de edificios que cachea instancias.

**Respuesta larga (párrafo):**
> `controladorCiudadanos` es el corazón de la simulación. Ejecuta un ciclo bien definido cada turno: (1) emigración de infelices/desempleados/sin vivienda/crisis, (2) crecimiento natural, (3) inmigración si la ciudad es atractiva, (4-5) asignación de vivienda y empleo, y (6) recálculo de felicidad con convergencia suave. Utiliza un registro interno de edificios que cachea instancias para permitr que los ciudadanos persistan en sus viviendas/empleos entre turnos. La felicidad se calcula con una fórmula que considera vivienda, empleo, servicios, parques, y recursos. Todo es configurable y defensivo contra inputs inválidos.

---

## Checklist para Entender la Clase

- [ ] Entiendo qué es CONFIG_DEFECTO y por qué está congelada
- [ ] Entiendo qué son los Maps (SUBTIPOS_RESIDENCIAL, etc.)
- [ ] Entiendo por qué #registroEdificios es importante
- [ ] Entiendo el orden de las 6 etapas y por qué ese orden
- [ ] Entiendo las 4 razones de emigración
- [ ] Entiendo las 3 condiciones de inmigración
- [ ] Entiendo la fórmula de felicidad objetivo
- [ ] Entiendo cómo funciona la convergencia (α)
- [ ] Entiendo el patrón de reutilización de instancias
- [ ] Entiendo early exit en asignaciones

**Si tienes checkbox en todos → ¡Dominas la clase!**

---

## Recursos Adicionales

- [PLAN_EXPRESS_2HORAS_controladorCiudadanos.md](./PLAN_EXPRESS_2HORAS_controladorCiudadanos.md) — Guía de aprendizaje rápido
- [CLAVE_RESPUESTAS_controladorCiudadanos.md](./CLAVE_RESPUESTAS_controladorCiudadanos.md) — Respuestas del autoexamen
- [negocio/controladorCiudadanos.js](./negocio/controladorCiudadanos.js) — Código fuente comentado
- [modelos/Ciudadano.js](./modelos/Ciudadano.js) — Modelo de ciudadano
- [modelos/Ciudad.js](./modelos/Ciudad.js) — Modelo de ciudad

---

**Versión:** 1.0  
**Última actualización:** Marzo 2026  
**Autor:** Adrián Sanpedro  
**Estado:** Listo para compartir con compañeros ✅
