City Builder Game es un simulador urbano donde los jugadores asumen el rol de alcalde
de una ciudad virtual. El objetivo principal es construir, desarrollar y gestionar una ciudad
próspera mediante la construcción de infraestructura, gestión de recursos, planificación
urbana y atención a las necesidades de los ciudadanos.
El sistema abarca los siguientes aspectos del dominio urbano:
 Planificación territorial: Diseño y organización del espacio urbano
 Construcción: Edificación de diferentes tipos de estructuras
 Gestión de recursos: Administración de dinero, electricidad, agua y alimentos
 Población: Simulación de ciudadanos con necesidades y comportamientos
 Economía urbana: Generación de ingresos, empleos y costos operativos
 Servicios públicos: Provisión de energía, agua y recreación
 Factores externos: Integración con datos climáticos y noticias de la realidad

Actores del Sistema
1. Jugador/Alcalde
Definición: Usuario humano que interactúa con el sistema para gestionar una ciudad
virtual.
Responsabilidades:
 Crear y nombrar su ciudad
 Construir y demoler edificios y vías
 Gestionar recursos económicos y naturales
 Tomar decisiones estratégicas sobre el desarrollo urbano
 Monitorear el bienestar de los ciudadanos
 Planificar rutas de transporte
2. Ciudadano (Entidad Simulada)
Definición: Habitante virtual de la ciudad que responde dinámicamente a las
condiciones urbanas.
Características:
 Identificador único
 Nivel de felicidad (0-100)

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

Necesidades:
 Vivienda
 Empleo
 Servicios públicos (salud, seguridad)
 Recursos básicos
o Agua (-X por turno)
o Electricidad (-Y por turno)
o Comida (-Z por turno)
Nota: Los valores de X,Y,Z pueden ser configurables desde una caja de
texto
 Recreación

Conceptos Fundamentales del Dominio
1. Ciudad (City)
Definición: Entidad principal que representa el espacio urbano completo gestionado
por el jugador.
Atributos:
 Nombre de la ciudad
 Región geográfica : Nombre de una ciudad real de Colombia (coordenadas
latitud/longitud), esta puede ser accedida desde https://api-colombia.com/
 Tamaño del mapa (ancho × alto, entre 15×15 hasta 30×30)
 Turno actual
 Puntuación acumulada
Composición:
 Mapa/Grid bidimensional
 Colección de edificios
 Red de vías/caminos
 Población de ciudadanos
 Estado de recursos

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

2. Mapa/Grid
Definición: Matriz bidimensional que representa el territorio disponible para la
construcción.
Características:
 Dimensiones configurables (mínimo 15×15 hasta máximo 30×30)
 Cada celda puede estar:
o Vacía (terreno sin uso)
o Ocupada por un edificio
o Ocupada por una vía

Representación:
 Sistema de coordenadas (x, y) donde (0,0) es la esquina superior izquierda
 Convenciones textuales para carga de mapas:
o g = terreno vacío (grass)
o r = vía (road)
o R1, R2 = edificios residenciales
o C1, C2 = edificios comerciales
o I1, I2 = edificios industriales
o S1, S2, S3 = edificios de servicio
o U1, U2 = plantas de utilidad
o P1 = parque
3. Edificios (Buildings)
Definición: Estructuras construibles que ocupan una celda del mapa y cumplen funciones
específicas.
A. Edificios Residenciales (Residential Buildings)
Propósito: Proveer vivienda para ciudadanos.
Tipos:
Tipo Capacidad Costo Consumo
Electricidad

Consumo Agua

Casa 4 ciudadanos $1,00
0
5 unidades/turno 3 unidades/turno

Apartament
o

12
ciudadanos

$3,00
0
15 unidades/turno 10

unidades/turno

Comportamiento:
 Albergan ciudadanos hasta su capacidad máxima

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

 Contribuyen al crecimiento poblacional
 Afectan la felicidad de sus habitantes
B. Edificios Comerciales (Commercial Buildings)
Propósito: Generar ingresos económicos y ofrecer empleos.
Tipos:
Tipo Empleo
s

Costo Ingreso/Turn
o

Consumo
Electricidad

Tienda 6 $2,00
0
$500 8 unidades/turno

Centro
Comercial

20 $8,00
0
$2,000 25 unidades/turno

Comportamiento:
 Requieren electricidad para funcionar
 Sin electricidad: no generan ingresos
 Emplean ciudadanos disponibles
C. Edificios Industriales (Industrial Buildings)
Propósito: Producir recursos y ofrecer empleos.
Tipos:
Tipo Empleo
s

Costo Producción Consumo

Fábric
a
15 $5,00
0
$800/turno Electricidad (20 u/t) + Agua (15

u/t)

Granja 8 $3,00
0
50
alimentos/turno

Agua (10 u/t)

D. Edificios de Servicio (Service Buildings)
Propósito: Aumentar felicidad de ciudadanos en su área de influencia.
Tipos:
Tipo Costo Radio Beneficio Consumo
Estación de Policía $4,00
0
5
celdas
+10
felicidad

Electricidad (15 u/t)
Estación de $4,00 5 +10 Electricidad (15 u/t)

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

Bomberos 0 celdas felicidad
Hospital $6,00
0
7
celdas
+10
felicidad

Electricidad (20 u/t) + Agua (10
u/t)

Nota los valores de beneficio pueden ser configurables desde cajas de texto
Comportamiento:
 Aumentan la felicidad de todos los habitantes

E. Plantas de Utilidad (Utility Plants)
Propósito: Generar recursos esenciales para el funcionamiento urbano.
Tipos:
Tipo Costo Producción Consumo
Planta
Eléctrica

$10,00
0

200
unidades/turno

Ninguno

Planta de Agua $8,000 150

unidades/turno
20
electricidad/turno

Comportamiento:
 Producción fija por turno
 La planta de agua depende de electricidad para funcionar
F. Parques (Parks)
Propósito: Aumentar felicidad mediante áreas recreativas.
Características:
 Costo: $1,500
 Beneficio: +5 felicidad para todos los habitantes
 No consumen recursos
G. Vías/Caminos (Roads)
Definición: Infraestructura de conectividad que permite el tránsito entre edificios.
Características:
 Costo por celda: $100
 No consumen recursos operativos
Función:
 Conectar edificios, ya que no se puede construir un edificio si no tiene una vía
adyacente

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

4. Recursos (Resources)
Definición: Elementos cuantificables necesarios para el funcionamiento de la ciudad.
A. Dinero (Money)
 Inicial: $50,000
 Puede ser aumentado por: Edificios comerciales e industriales (fábricas)
 Consumido por: Construcción y mantenimiento
B. Electricidad (Electricity)
 Inicial: 0 (debe construirse plantas), pero este valor puede ser configurable
desde una caja de texto y puede ser cambiado en cualquier momento del juego
 Unidad: unidades/turno
 Generado por: Plantas eléctricas
 Consumido por: Todos los edificios excepto parques
 Si la energía llega en un momento a ser negativa se termina el juego
C. Agua (Water)
 Inicial: 0 (debe construirse plantas), pero este valor puede ser configurable
desde una caja de texto y puede ser cambiado en cualquier momento del juego
 Unidad: unidades/turno
 Generado por: Plantas de agua
 Consumido por: Edificios residenciales, industriales, hospitales y demás
edificios
 Balance negativo: En caso de ser negativo se termina el juego
D. Alimentos (Food)
 Inicial: 0, pero este valor puede ser configurable desde una caja de texto y
puede ser cambiado en cualquier momento del juego
 Unidad: unidades acumulables
 Generado por: Granjas
 Consumido por: Ciudadanos (consumo indirecto vía felicidad)
 Impacto: Alimentos suficientes aumentan felicidad

Sistema de Turnos (Turn-Based System)
Definición: Ciclo temporal que estructura la evolución de la ciudad.
Duración: 1 turno = X segundos (tiempo real), puede ser configurado en una caja de texto
Acciones por turno:
1. Cálculo de producción de recursos

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

2. Cálculo de consumo de recursos
3. Aplicación de costos de mantenimiento
4. Actualización de felicidad de ciudadanos
5. Actualización de puntuación
6. Guardado automático en LocalStorage

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

Sistema de Ciudadanos (Citizens System)
Definición: Simulación de población urbana con comportamiento autónomo.
Creación de Ciudadanos
Condiciones:
Se crean automáticamente en cada “turno” si se cumplen las siguientes condiciones
o Hay viviendas disponibles (capacidad residencial &gt; población actual)
o Felicidad promedio de la ciudad &gt; 60
o Hay empleos disponibles
Tasa de crecimiento: 1-3 ciudadanos por turno si se cumplen condiciones, este
valor es parametrizable

Asignación Automática
 Vivienda: Asignación a edificios residenciales con capacidad
 Empleo: Asignación a edificios comerciales/industriales con vacantes
Cálculo de Felicidad Individual
Fórmula base:
felicidad =factores_positivos - factores_negativos
Factores positivos:
 Tiene vivienda: +20
 Tiene empleo: +15
 Parques, hospitales, estaciones de policía según su valor
Factores negativos:
 Sin vivienda: -20
 Sin empleo: -15

Sistema de Puntuación (Scoring System)
Definición: Métrica cuantitativa del desempeño del jugador como alcalde.
Fórmula:
score = (población × 10) +
(felicidad_promedio × 5) +
(dinero ÷ 100) +
(número_edificios × 50) +

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

(balance_electricidad × 2) +
(balance_agua × 2) +
bonificaciones - penalizaciones
Bonificaciones
 Todos los ciudadanos empleados: +500
 Felicidad &gt; 80: +300
 Todos los recursos positivos: +200
 Ciudad &gt; 1,000 habitantes: +1,000
Penalizaciones
 Dinero negativo: -500
 Electricidad negativa: -300
 Agua negativa: -300
 Felicidad &lt; 40: -400
 Por cada ciudadano desempleado: -10

Sistema de Rutas (Routing System)
Definición: Mecanismo para calcular caminos óptimos entre edificios utilizando la red de
vías.
Algoritmo: Dijkstra (implementado en backend)
Proceso:
1. El jugador selecciona edificio de origen
2. El jugador selecciona edificio de destino
3. El sistema genera matriz del mapa:
o 0 = celda no transitable (edificios, terreno vacío)
o 1 = celda transitable (vías)
4. Se envía petición POST al backend: /api/calculate-route
5. El backend retorna array de coordenadas representando la ruta
6. El frontend anima la ruta en el mapa
Casos especiales:
 Sin ruta disponible: mensaje de error
 Edificios no conectados por vías: imposible calcular

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

Integraciones Externas
A. API del Clima (OpenWeatherMap)
Propósito: Obtener datos meteorológicos reales de la región de la ciudad.
Endpoint: GET
https://api.openweathermap.org/data/2.5/weather?lat={lat}&amp;lon={lon}
Frecuencia de actualización: Cada 30 minutos
Datos obtenidos:
 Temperatura (°C)
 Condición climática (soleado, lluvioso, nublado, tormenta)
 Humedad (%)
 Velocidad del viento (km/h)
B. API de Noticias (NewsAPI)
Propósito: Integrar noticias reales de la región para inmersión.
Endpoint: GET https://newsapi.org/v2/top-headlines?country={code}
Frecuencia de actualización: Cada 30 minutos
Datos obtenidos:
 Últimas 5 noticias
 Título
 Descripción breve
 Imagen (si disponible)
 Enlace a noticia completa

Reglas del Dominio
A. Reglas de Construcción
1. Exclusividad espacial: Una celda no puede estar ocupada por más de un
elemento (edificio o vía)
2. Restricción presupuestaria: No se puede construir si el costo excede el dinero
disponible
3. Adyacencia obligatoria: Los edificios deben estar al lado de vías adyacentes
4. Límite territorial: El tamaño del mapa es fijo (configurado en creación), no se
puede expandir

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

B. Reglas de Población
1. Capacidad residencial: Ciudadanos no pueden exceder la suma de capacidades
de edificios residenciales
2. Requisitos de crecimiento:
o Capacidad de vivienda disponible
o Felicidad promedio &gt; 60
o Empleos disponibles
3. Asignación automática: Ciudadanos sin hogar/empleo se asignan
automáticamente si hay disponibilidad
C. Reglas de Rutas
1. Transitabilidad: Solo las vías son transitables
2. Existencia de camino: Si no hay secuencia de vías conectando origen y destino,
no hay ruta
3. Optimalidad: El algoritmo siempre retorna la ruta de menor distancia
D. Reglas de Persistencia
1. Guardado automático: Cada 30 segundos
2. Guardado en LocalStorage: Toda la ciudad se serializa a JSON
3. Exportación opcional: El jugador puede exportar manualmente a archivo JSON

Historias de Usuario - City Builder Game
Épicas del Proyecto
Épica 1: Configuración y Gestión de Ciudad
Como jugador, quiero crear y configurar mi ciudad para comenzar a construir mi imperio
urbano.
Épica 2: Construcción y Desarrollo Urbano
Como jugador, quiero construir edificios y vías para desarrollar mi ciudad y hacerla crecer.
Épica 3: Gestión de Recursos y Población
Como jugador, quiero gestionar recursos y ciudadanos para mantener mi ciudad
funcionando eficientemente.
Épica 4: Planificación y Rutas
Como jugador, quiero planificar rutas óptimas entre edificios para optimizar el transporte
en mi ciudad.
Épica 5: Información Contextual

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

Como jugador, quiero ver información del clima y noticias de mi región para una
experiencia más inmersiva.
Épica 6: Competencia y Ranking
Como jugador, quiero ver mi puntuación y competir en un ranking para motivarme a
mejorar mi ciudad.

Historias de Usuario Detalladas
HU-001: Creación de Nueva Ciudad
Como jugador nuevo
Quiero crear una ciudad ingresando sus datos básicos
Para comenzar a jugar y construir mi imperio urbano
Criterios de Aceptación:
 [ ] El sistema muestra un formulario con los siguientes campos obligatorios:
o Nombre de la ciudad (texto, máx 50 caracteres)
o Nombre del alcalde/jugador (texto, máx 50 caracteres)
o Región geográfica (selección de ciudad o coordenadas lat/lon)
o Tamaño del mapa (selector entre 15x15 y 30x30)
 [ ] El sistema valida que todos los campos estén completos antes de continuar
 [ ] El sistema valida que el tamaño del mapa esté dentro del rango permitido
 [ ] Al confirmar, el sistema crea una ciudad vacía con recursos iniciales:
o Dinero: $50,000
o Electricidad: 0 (debe construir plantas)
o Agua: 0 (debe construir plantas)
o Población: 0
 [ ] El sistema redirige automáticamente a la vista principal del juego
 [ ] El sistema guarda la configuración inicial en LocalStorage
Prioridad: Alta
Dependencias: Ninguna
HU-002: Cargar Mapa desde Archivo de Texto
Como jugador
Quiero cargar un mapa prediseñado desde un archivo de texto
Para comenzar con una ciudad ya estructurada
Criterios de Aceptación:

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

 [ ] El sistema muestra un botón &quot;Cargar Mapa&quot; en la pantalla de configuración
 [ ] Al hacer click, se abre un selector de archivos que acepta archivos .txt
 [ ] El sistema valida que el archivo tenga el formato correcto:
 [ ] El sistema parsea correctamente las convenciones del mapa (g, r, R1, C1, I1, S1,
etc.)
 [ ] El sistema crea instancias de Building para cada edificio en el mapa
 [ ] El sistema crea instancias de Road para cada celda de vía
 [ ] El sistema calcula recursos iniciales basándose en los edificios existentes
 [ ] Si el archivo tiene errores de formato, muestra mensaje de error específico
 [ ] El mapa cargado se renderiza correctamente en la interfaz
 [ ] El sistema guarda el estado cargado en LocalStorage
Prioridad: Alta
Dependencias: HU-001
HU-003: Construir Edificio Residencial
Como jugador
Quiero construir casas y apartamentos
Para aumentar la capacidad de población de mi ciudad
Criterios de Aceptación:
 [ ] El sistema muestra un menú de construcción con tipos de edificios residenciales:
o Casa (capacidad: 4, costo: $1,000)
o Apartamento (capacidad: 12, costo: $3,000)
 [ ] Al seleccionar un tipo, el cursor cambia para indicar modo construcción
 [ ] Al hacer click en una celda vacía, el sistema valida:
o La celda está vacía (no hay otro edificio)
o Hay suficiente dinero para construir
o Obligatorio: Hay una vía adyacente
 [ ] Si la validación pasa:
o Se descuenta el costo del dinero disponible
o Se renderiza el edificio en el mapa
o Se muestra notificación de éxito
 [ ] Si la validación falla, se muestra mensaje de error específico
 [ ] El sistema actualiza el contador de edificios residenciales
 [ ] El edificio consume electricidad y agua (si están disponibles)

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

Prioridad: Alta
Dependencias: HU-001
HU-004: Construir Edificio Comercial
Como jugador
Quiero construir tiendas y centros comerciales
Para generar ingresos y empleos en mi ciudad
Criterios de Aceptación:
 [ ] El sistema muestra tipos de edificios comerciales:
o Tienda (empleos: 6, costo: $2,000)
o Centro Comercial (empleos: 20, costo: $8,000)
 [ ] El proceso de construcción sigue el mismo flujo que HU-003
 [ ] El edificio comercial genera dinero por turno:
o Tienda: $500/turno
o Centro Comercial: $2,000/turno
 [ ] El edificio comercial consume electricidad
 [ ] El edificio comercial ofrece empleos a los ciudadanos
 [ ] El sistema muestra el ingreso generado en el panel de estadísticas
 [ ] Si no hay electricidad, el edificio no genera dinero
Prioridad: Alta
Dependencias: HU-001, HU-003
HU-005: Construir Edificio Industrial
Como jugador
Quiero construir fábricas y granjas
Para producir recursos y empleos
Criterios de Aceptación:
 [ ] El sistema muestra tipos de edificios industriales:
o Fábrica (empleos: 15, costo: $5,000, produce: dinero)
o Granja (empleos: 8, costo: $3,000, produce: alimentos)
 [ ] La fábrica genera dinero por turno: $800/turno
 [ ] La fábrica consume agua y electricidad
 [ ] La granja produce alimentos: +50 unidades/turno
 [ ] La granja consume agua
 [ ] Los edificios industriales ofrecen empleos

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

 [ ] Si faltan recursos (agua/electricidad), la producción se reduce al 50%
Prioridad: Alta
Dependencias: HU-001
HU-006: Construir Edificios de Servicio
Como jugador
Quiero construir policía, bomberos y hospitales
Para aumentar la felicidad de los ciudadanos
Criterios de Aceptación:
 [ ] El sistema muestra tipos de edificios de servicio:
o Estación de Policía (costo: $4,000, radio: 5 celdas)
o Estación de Bomberos (costo: $4,000, radio: 5 celdas)
o Hospital (costo: $6,000, radio: 7 celdas)
 [ ] Cada edificio de servicio consume electricidad
 [ ] Los edificios de servicio aumentan felicidad a toda la ciudad:
o Policía: +10 felicidad
o Bomberos: +10 felicidad
o Hospital: +10 felicidad
 [ ] El hospital consume también agua
Prioridad: Media
Dependencias: HU-001, HU-013
HU-007: Construir Plantas de Utilidad
Como jugador
Quiero construir plantas eléctricas y de agua
Para proveer recursos esenciales a mi ciudad
Criterios de Aceptación:
 [ ] El sistema muestra tipos de utilidades:
o Planta Eléctrica (costo: $10,000, produce: 200 unidades/turno)
o Planta de Agua (costo: $8,000, produce: 150 unidades/turno)
 [ ] La planta eléctrica no consume recursos
 [ ] La planta de agua consume 20 unidades de electricidad/turno
 [ ] El sistema muestra producción total en panel de recursos
 [ ] El sistema muestra balance (producción - consumo) para cada recurso

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

Prioridad: Alta
Dependencias: HU-001
HU-008: Construir Parques
Como jugador
Quiero construir parques
Para aumentar la felicidad de los ciudadanos cercanos
Criterios de Aceptación:
 [ ] El sistema permite construir parques (costo: $1,500)
 [ ] Los parques no consumen recursos
 [ ] Los parques aumentan felicidad +5 puntos a todos los ciudadanos
 [ ] Los parques no tienen capacidad ni empleos
 [ ] Se puede construir múltiples parques
Prioridad: Baja
Dependencias: HU-001, HU-013
HU-009: Construir Vías/Caminos
Como jugador
Quiero construir vías entre edificios
Para conectar mi ciudad y permitir rutas de transporte
Criterios de Aceptación:
 [ ] El sistema muestra opción &quot;Construir Vía&quot; en menú de construcción
 [ ] Al seleccionar, el modo cambia a construcción de vías
 [ ] El jugador puede hacer click en celdas vacías para colocar vías
 [ ] Cada celda de vía cuesta $100
 [ ] Las vías no pueden colocarse sobre edificios existentes
 [ ] El sistema muestra el costo total antes de confirmar
 [ ] Las vías se renderizan con textura diferente a terreno vacío
 [ ] Las vías son necesarias para calcular rutas (HU-012)
Prioridad: Alta
Dependencias: HU-001
HU-010: Eliminar Edificios y Vías

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

Como jugador
Quiero demoler edificios y vías
Para reorganizar mi ciudad
Criterios de Aceptación:
 [ ] El sistema muestra opción &quot;Demoler&quot; en menú
 [ ] Al seleccionar demoler, el cursor cambia a modo demolición
 [ ] Al hacer click en un edificio/vía:
o Se muestra confirmación &quot;¿Demoler [nombre]?&quot;
o Se informa si hay ciudadanos afectados (en edificios residenciales)
 [ ] Al confirmar demolición:
o Se recupera 50% del costo de construcción
o Se elimina el edificio/vía del mapa
o Los ciudadanos afectados quedan sin hogar/empleo
o Se actualizan recursos de producción/consumo
 [ ] Se muestra notificación con dinero recuperado
Prioridad: Media
Dependencias: HU-003, HU-004, HU-005, HU-009

HU-011: Ver Información de Edificio
Como jugador
Quiero hacer click en un edificio para ver su información
Para conocer sus estadísticas y estado actual
Criterios de Aceptación:
 [ ] Al hacer click en un edificio, se muestra panel lateral/modal con:
o Tipo y nombre del edificio
o Costo de construcción
o Costo de mantenimiento/turno
o Recursos que consume
o Recursos que produce
o Capacidad (vivienda/empleos)
o Ocupación actual
 [ ] Para edificios residenciales:

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

o Número de Ciudadanos viviendo actualmente
o Nivel de felicidad promedio
 [ ] Para edificios comerciales/industriales:
o Empleados actuales
 [ ] El panel incluye botón &quot;Demoler&quot; con confirmación
 [ ] El panel se cierra al hacer click fuera o en botón cerrar
Prioridad: Media
Dependencias: HU-003, HU-004, HU-005, HU-006
HU-012: Calcular Ruta Óptima entre Edificios
Como jugador
Quiero calcular la ruta más corta entre dos edificios
Para planificar el transporte en mi ciudad
Criterios de Aceptación:
 [ ] El sistema muestra botón &quot;Calcular Ruta&quot; en la interfaz
 [ ] Al activar, el jugador selecciona:
1. Edificio de origen (click en el mapa)
2. Edificio de destino (click en el mapa)
 [ ] El sistema construye matriz del mapa donde:
o 0 = celda no transitable (edificios, terreno vacío)
o 1 = celda transitable (vías)
 [ ] El sistema llama al backend: POST /api/calculate-route con:
 { &quot;map&quot;: [[0,1,1,...], ...], &quot;origin&quot;: {&quot;x&quot;: 2, &quot;y&quot;: 3}, &quot;destination&quot;: {&quot;x&quot;: 10, &quot;y&quot;: 15}}
 [ ] El sistema muestra loader mientras espera respuesta
 [ ] Al recibir respuesta del backend:
o Se anima la ruta en el mapa (resaltar celdas)
 [ ] Si no existe ruta, se muestra mensaje: &quot;No hay ruta disponible entre estos
edificios&quot;
 [ ] El sistema permite calcular nueva ruta o cancelar
 [ ] La ruta se limpia al hacer nueva acción
Prioridad: Alta
Dependencias: HU-009, Backend de Dijkstra
HU-013: Sistema de Gestión de Ciudadanos
Como jugador

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

Quiero que los ciudadanos se asignen automáticamente a edificios
Para ver mi ciudad poblarse dinámicamente
Criterios de Aceptación:
 [ ] Los ciudadanos se crean automáticamente cuando:
o Hay viviendas disponibles (edificios residenciales con capacidad)
o La felicidad promedio de la ciudad &gt; 60
o Hay empleos disponibles (edificios comerciales/industriales)
 [ ] Cada turno, el sistema:
o Verifica capacidad de vivienda disponible
o Crea nuevos ciudadanos (1-3 por turno si hay espacio) este valor puede ser
configurable
o Asigna ciudadanos sin hogar a viviendas disponibles
o Asigna ciudadanos desempleados a trabajos disponibles
 [ ] Cada ciudadano tiene propiedades:
o ID único
o Nivel de felicidad (0-100)
 [ ] El sistema calcula felicidad individual basándose en:
o Tiene vivienda: +20
o Tiene empleo: +15
o Servicios: +10 por servicio (policía, bomberos, hospital) en toda la ciudad
o Parques: +5 por parque
 [ ] El sistema muestra estadísticas de población:
o Total de ciudadanos
o Empleados / Desempleados
o Felicidad promedio

Prioridad: Alta
Dependencias: HU-003, HU-004, HU-005, HU-006
HU-014: Gestión Automática de Recursos por Turno
Como jugador
Quiero que los recursos se actualicen automáticamente cada turno
Para ver la evolución dinámica de mi ciudad
Criterios de Aceptación:
 [ ] El sistema ejecuta un ciclo de actualización cada 10 segundos (1 turno)
 [ ] En cada turno, el sistema:

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

1. Calcula producción de recursos:
 Dinero: suma de ingresos de edificios comerciales e industriales
 Electricidad: suma de producción de plantas eléctricas
 Agua: suma de producción de plantas de agua
 Alimentos: suma de producción de granjas
2. Calcula consumo de recursos:
 Suma consumo de todos los edificios activos
3. Aplica balance: recurso += producción - consumo
4. Aplica costos de mantenimiento de edificios
5. Actualiza felicidad de ciudadanos
6. Procesa crecimiento de población
7. Procesa migraciones (si aplica)
8. Actualiza puntuación
 [ ] El sistema muestra notificación si algún recurso llega a 0:
o &quot;¡Alerta! Te has quedado sin [recurso]&quot;
o Consecuencias (ej: edificios dejan de funcionar)

Prioridad: Alta
Dependencias: HU-001, HU-007, HU-013

HU-015: Visualizar Panel de Recursos
Como jugador
Quiero ver mis recursos actuales en tiempo real
Para tomar decisiones informadas sobre construcción
Criterios de Aceptación:
 [ ] El sistema muestra panel fijo en la interfaz con:
o Dinero: $XX,XXX (verde si &gt; $10,000, amarillo si &lt; $5,000, rojo si &lt; $1,000)
o Electricidad: XXX / XXX unidades (producción/consumo)
o Agua: XXX / XXX unidades (producción/consumo)
o Alimentos: XXX unidades
o Población: XXX ciudadanos
o Felicidad promedio: XX%
 [ ] El panel se actualiza automáticamente cada turno

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

 [ ] Al hacer hover sobre un recurso, se muestra tooltip con:
o Producción detallada
o Consumo detallado
o Balance neto
 [ ] El panel es responsive (se adapta a móvil/tablet/desktop)
Prioridad: Alta
Dependencias: HU-014
HU-016: Integración con API del Clima
Como jugador
Quiero ver el clima actual de mi región
Para tener una experiencia más inmersiva
Criterios de Aceptación:
 [ ] El sistema llama a OpenWeatherMap API al cargar la ciudad:
 GET
https://api.openweathermap.org/data/2.5/weather?lat={lat}&amp;lon={lon}&amp;appid={key}
 [ ] El sistema muestra widget de clima con:
o Temperatura actual (°C)
o Condición (soleado, lluvioso, nublado, tormenta)
o Icono animado del clima
o Humedad
o Velocidad del viento
 [ ] El clima se actualiza cada 30 minutos
Prioridad: Media
Dependencias: HU-001, HU-014

HU-017: Integración con API de Noticias
Como jugador
Quiero ver noticias de mi región
Para sentir que mi ciudad está conectada con el mundo real
Criterios de Aceptación:
 [ ] El sistema llama a NewsAPI al cargar la ciudad:
 GET https://newsapi.org/v2/top-headlines?country={code}&amp;apiKey={key}

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

 [ ] El sistema muestra panel de noticias con:
o Últimas 5 noticias de la región
o Título de la noticia
o Descripción breve (2-3 líneas)
o Imagen (si disponible)
o Enlace a noticia completa
o Timestamp
 [ ] Las noticias se actualizan cada 30 minutos
Prioridad: Baja
Dependencias: HU-001
HU-018: Cálculo y Visualización de Puntuación
Como jugador
Quiero ver mi puntuación en tiempo real
Para saber qué tan bien estoy gestionando mi ciudad
Criterios de Aceptación:
 [ ] El sistema calcula puntuación cada turno con la fórmula:
 score = (population * 10) + (happiness_avg * 5) + (money / 100) +
(num_buildings * 50) + (electricity_balance * 2) + (water_balance * 2) +
bonuses - penalties
 [ ] Bonificaciones:
o Todos los ciudadanos empleados: +500
o Felicidad &gt; 80: +300
o Recursos todos positivos: +200
o Ciudad &gt; 1000 habitantes: +1000
 [ ] Penalizaciones:
o Dinero negativo: -500
o Electricidad negativa: -300
o Agua negativa: -300
o Felicidad &lt; 40: -400
o Ciudadanos desempleados: -10 por ciudadano
 [ ] El sistema muestra puntuación en panel principal
 [ ] El sistema muestra desglose de puntuación:
o Puntos por población

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

o Puntos por felicidad
o Puntos por edificios
o Puntos por recursos
o Bonificaciones
o Penalizaciones
o Total
 [ ] La puntuación se guarda en cada turno para ranking
Prioridad: Media
Dependencias: HU-014, HU-015
HU-019: Sistema de Ranking Local
Como jugador
Quiero ver un ranking de las mejores ciudades
Para comparar mi desempeño con otras partidas
Criterios de Aceptación:
 [ ] El sistema guarda automáticamente el puntaje en LocalStorage:
 { &quot;ranking&quot;: [ { &quot;cityName&quot;: &quot;Nueva Ciudad&quot;, &quot;mayor&quot;: &quot;Juan Pérez&quot;,
&quot;score&quot;: 15420, &quot;population&quot;: 1250, &quot;happiness&quot;: 78, &quot;turns&quot;: 145,
&quot;date&quot;: &quot;2025-01-27T10:30:00Z&quot; } ]}
 [ ] El ranking se ordena por puntuación (descendente)
 [ ] El sistema muestra modal/página de ranking con:
o Top 10 ciudades
o Posición (#1, #2, #3, etc.)
o Nombre de ciudad
o Alcalde
o Puntuación
o Población
o Felicidad promedio
o Número de turnos jugados
o Fecha
 [ ] La ciudad actual del jugador se resalta en el ranking
 [ ] Si no está en top 10, se muestra abajo: &quot;Tu ciudad: #XX&quot;
 [ ] El sistema permite:
o Reiniciar ranking (con confirmación)
o Exportar ranking a JSON

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

 [ ] El ranking persiste entre sesiones (LocalStorage)
Prioridad: Media
Dependencias: HU-019
HU-020: Guardar y Cargar Partida
Como jugador
Quiero que mi progreso se guarde automáticamente
Para poder continuar mi partida más tarde
Criterios de Aceptación:
 [ ] El sistema guarda automáticamente en LocalStorage cada 30 segundos
 [ ] El sistema guarda:
o Estado completo de la ciudad (nombre, alcalde, coordenadas)
o Matriz del mapa con todos los edificios y vías
o Estado de todos los recursos
o Lista de ciudadanos con sus propiedades
o Turno actual
o Puntuación actual
o Histórico de recursos (últimos 20 turnos para gráficos)
 [ ] Al cargar la aplicación, el sistema:
o Detecta si hay partida guardada
o Muestra mensaje: &quot;¿Deseas continuar tu partida anterior?&quot;
o Opciones: &quot;Continuar&quot; o &quot;Nueva Ciudad&quot;
 [ ] Si el jugador elige &quot;Continuar&quot;:
o Se carga el estado completo desde LocalStorage
o Se reconstruyen todas las instancias de objetos
o Se restaura la interfaz al estado guardado
o El ciclo de turnos continúa desde donde se dejó
 [ ] El sistema muestra indicador &quot;Guardando...&quot; al guardar
 [ ] El sistema permite:
o Guardar manualmente (botón &quot;Guardar Partida&quot;)
o Eliminar partida guardada (con confirmación)

Prioridad: Alta
Dependencias: HU-001, HU-014
HU-021: Exportar Estado de Ciudad a JSON

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

Como jugador
Quiero exportar mi ciudad a un archivo JSON
Para compartirla o crear respaldos
Criterios de Aceptación:
 [ ] El sistema muestra opción &quot;Exportar Ciudad&quot; en menú
 [ ] Al hacer click, el sistema genera archivo JSON con:
 { &quot;cityName&quot;: &quot;...&quot;, &quot;mayor&quot;: &quot;...&quot;, &quot;gridSize&quot;: {&quot;width&quot;: 20, &quot;height&quot;: 20},
&quot;coordinates&quot;: {&quot;lat&quot;: 4.6097, &quot;lon&quot;: -74.0817}, &quot;turn&quot;: 145, &quot;score&quot;: 8920, &quot;map&quot;:
[[...], [...], ...], &quot;buildings&quot;: [{...}, {...}], &quot;roads&quot;: [{...}, {...}], &quot;resources&quot;: {...},
&quot;citizens&quot;: [{...}, {...}], &quot;population&quot;: 450, &quot;happiness&quot;: 75}
 [ ] El archivo se descarga con nombre: ciudad_{nombre}_{fecha}.json
 [ ] El sistema muestra notificación de éxito al exportar
 [ ] El JSON exportado puede ser reimportado (HU-002)
 [ ] El formato es legible (pretty-print con indentación)
Prioridad: Baja
Dependencias: HU-021
HU-022: Diseño Responsive - Vista Móvil
Como jugador en dispositivo móvil
Quiero que la interfaz se adapte a mi pantalla
Para poder jugar cómodamente desde mi teléfono
Criterios de Aceptación:
 [ ] En resoluciones &lt; 768px:
o El mapa ocupa el 100% del ancho de la pantalla
o Los paneles se organizan verticalmente
o El menú de construcción se muestra como tabs en la parte inferior
o El panel de recursos se muestra como header colapsable
o Las estadísticas se acceden mediante botón flotante
 [ ] Controles táctiles optimizados:
o Botones de al menos 44x44px (target táctil mínimo)
o Tap en edificio para seleccionar
o Tap en celda vacía para construir
o Swipe horizontal para scroll del menú de edificios
 [ ] El mapa es scrollable vertical y horizontalmente
 [ ] Zoom mediante pinch (dos dedos)

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

 [ ] El modal de información de edificio ocupa 80% de la pantalla
 [ ] Las notificaciones se muestran en la parte superior
 [ ] El widget de clima es compacto (icono + temperatura)
 [ ] Las noticias se muestran en carrusel horizontal
Prioridad: Alta
Dependencias: Todas las HUs de funcionalidad
HU-023: Diseño Responsive - Vista Tablet
Como jugador en tablet
Quiero una interfaz optimizada para pantalla mediana
Para aprovechar el espacio disponible
Criterios de Aceptación:
 [ ] En resoluciones 768px - 1024px:
o Layout en dos columnas: mapa (70%) + sidebar (30%)
o El mapa muestra grid completo sin scroll horizontal
o Panel de recursos en sidebar superior
o Menú de construcción en sidebar central
o Estadísticas en sidebar inferior
o Widget de clima y noticias en tabs laterales
 [ ] Soporte para orientación vertical y horizontal
 [ ] En horizontal: layout optimizado con sidebars izquierdo y derecho
 [ ] En vertical: similar a móvil pero con más espacio
 [ ] Tooltips más grandes al hacer hover
 [ ] Modales ocupan 60% de la pantalla
 [ ] Botones de tamaño medium (adecuados para touch)
Prioridad: Media
Dependencias: HU-023
HU-024: Diseño Responsive - Vista Desktop
Como jugador en computadora de escritorio
Quiero una interfaz completa con todos los paneles visibles
Para gestionar mi ciudad eficientemente
Criterios de Aceptación:
 [ ] En resoluciones &gt; 1024px:
o Layout en tres secciones: sidebar izquierdo, mapa central, sidebar derecho

Primer Proyecto del Curso
Desarrollo Frontend

FECHA ELABORACIÓN DEL
DOCUMENTO: 02/Febrero/2026
VERSIÓN: 1

o Sidebar izquierdo (250px):
 Panel de recursos
 Menú de construcción
o Mapa central (flexible):
 Grid completo visible
 Controles de zoom (+/-)
o Sidebar derecho (300px):
 Widget de clima
 Panel de noticias
 Estadísticas resumidas

 [ ] Hover effects en todos los elementos interactivos
 [ ] Tooltips informativos al hacer hover en edificios
 [ ] Cursor personalizado en modo construcción
 [ ] Atajos de teclado:
o B: Abrir menú de construcción
o R: Modo construcción de vías
o D: Modo demolición
o ESC: Cancelar modo actual
o Space: Pausar/Reanudar
o S: Guardar partida
 [ ] Modales centrados (50% max-width)
 [ ] Animaciones suaves en transiciones
Prioridad: Alta
Dependencias: HU-023, HU-024
Consideración Final: Solo se puede utilizar html, css y javascript puro, está totalmente
prohibido que dentro de un archivo html esté incluido código css o javascript, deben
estar totalmente separados, por cada hallazgo de incumplimiento serán -0.5 décimas de
la nota del proyecto
