## City Builder Game

Simulador urbano donde el jugador asume el rol de alcalde y gestiona el crecimiento de una ciudad desde cero. El objetivo es equilibrar recursos, población y desarrollo para construir una ciudad eficiente y sostenible.

### Características principales

- **Construcción y planificación**: desarrollo de infraestructura (viviendas, comercios, industria, servicios y vías).
- **Gestión de recursos**: control de dinero, electricidad, agua y alimentos.
- **Simulación de población**: ciudadanos con necesidades, empleo y nivel de felicidad.
- **Sistema por turnos**: la ciudad evoluciona dinámicamente en ciclos de tiempo.
- **Economía urbana**: generación de ingresos, costos operativos y toma de decisiones estratégicas.
- **Rutas inteligentes**: cálculo de caminos óptimos mediante algoritmos en backend.
- **Integraciones externas**: clima y noticias en tiempo real para mayor inmersión.

### Componentes del sistema

- **Ciudad**: entidad principal con mapa, recursos, población y estado general.
- **Mapa (Grid)**: matriz bidimensional donde se construyen edificios y vías.
- **Edificios**:
  - Residenciales: alojan ciudadanos
  - Comerciales: generan ingresos y empleo
  - Industriales: producen recursos
  - Servicios: mejoran la felicidad
  - Utilidades: generan electricidad y agua
- **Ciudadanos**: entidades dinámicas con necesidades y comportamiento autónomo.

### Mecánicas clave

- Crecimiento poblacional condicionado por vivienda, empleo y felicidad.
- Balance de recursos (producción vs consumo).
- Sistema de puntuación basado en desempeño de la ciudad.
- Restricciones de construcción (espacio, dinero y conectividad).
- Persistencia de datos (guardado automático y exportación).

### Consideraciones

- Uso de algoritmos como **Dijkstra** para rutas.
- Consumo de APIs externas (clima y noticias).
- Persistencia en **LocalStorage**.