import { Juego } from "../modelos/Juego.js";
import { Ciudadano } from "../modelos/Ciudadano.js";
import { EdificioResidencial } from "../modelos/EdificioResidencial.js";
import { EdificioComercial } from "../modelos/EdificioComercial.js";
import { EdificioIndustrial } from "../modelos/EdificioIndustrial.js";
import { TipoResidencial, TipoComercial, TipoIndustrial } from "../modelos/Enums.js";

// ─── Parámetros de la simulación (todos sobreescribibles por config) ───────────
const CONFIG_DEFECTO = Object.freeze({
    minCrecimiento: 1,          // mínimo ciudadanos creados por turno
    maxCrecimiento: 3,          // máximo ciudadanos creados por turno
    umbralFelicidadCrecimiento: 60, // felicidad promedio mínima para crear nuevos ciudadanos
    requerirEmpleoDisponible: true,
    alpha: 0.3,                 // velocidad de convergencia de felicidad (0‑1)
    BASE_FELICIDAD: 40,
    BONO_VIVIENDA: 20,
    PENALIZACION_VIVIENDA: -25,
    BONO_EMPLEO: 15,
    PENALIZACION_EMPLEO: -15,
    BONO_SERVICIO: 10,
    MAX_SERVICIOS: 3,           // cap de servicios que suman felicidad
    BONO_PARQUE: 5,
    MAX_PARQUES: 6,             // cap de parques que suman felicidad
    PENALIZACION_RECURSO: -20,  // se aplica por recurso (agua / electricidad) en 0
    // EMIGRACIÓN
    umbralFelicidadEmigrar: 10,              // Ciudadanos con felicidad < 10 se van
    maxTurnosDesempleado: 5,                 // Max turnos sin empleo antes de emigrar
    maxTurnosSinVivienda: 3,                 // Max turnos sin vivienda antes de emigrar
    porcentajeEmigranCrisis: 25,             // % que emigra en crisis económica
    dineroNegativoTurnosMax: 3,              // Turnos con dinero negativo para crisis

    // INMIGRACIÓN
    umbralFelicidadInmigrar: 80,             // Felicidad promedio mínima para inmigración
    inmigrantesMin: 1,
    inmigrantesMax: 3,
    dineroMinimoInmigracion: 50000,          // Dinero mínimo tesorería
    capacidadResidualLibreMin: 0.10          // Mínimo 10% viviendas libres
});

// ─── Mapas de subtipo → tipo (constantes de módulo) ───────────────────────────
const SUBTIPOS_RESIDENCIAL = new Map([
    ["R1", TipoResidencial.CASA],
    ["R2", TipoResidencial.APARTAMENTO]
]);

const SUBTIPOS_COMERCIAL = new Map([
    ["C1", TipoComercial.TIENDA],
    ["C2", TipoComercial.CENTRO_COMERCIAL]
]);

const SUBTIPOS_INDUSTRIAL = new Map([
    ["I1", TipoIndustrial.FABRICA],
    ["I2", TipoIndustrial.GRANJA]
]);

const SUBTIPOS_POLICIA = new Set(["S1"]);
const SUBTIPOS_BOMBEROS = new Set(["S2"]);
const SUBTIPOS_HOSPITAL = new Set(["S3"]);
const SUBTIPOS_PARQUES   = new Set(["P1"]);

// ─── Clase principal ───────────────────────────────────────────────────────────
export class controladorCiudadanos{
    #juego;
    #config;
    // Registro de instancias de edificios por coordenada "y-x".
    // Permite reutilizar la misma instancia entre turnos para que
    // residentes[] y empleados[] persistan en memoria.
    #registroEdificios;
    #contadorId;
    #turnosDineroNegativo;
    #ultimoEventoMigracion;

    /**
     * @param {Juego} juego
     * @param {Partial<typeof CONFIG_DEFECTO>} config  Parámetros opcionales
     */
    constructor(juego, config = {}) {
        if (!(juego instanceof Juego)) {
            throw new Error("SistemaCiudadanos requiere una instancia válida de Juego");
        }
        this.#juego         = juego;
        this.#config        = { ...CONFIG_DEFECTO, ...config };
        this.#registroEdificios = new Map();
        this.#contadorId    = this._obtenerMaxIdCiudadano();
        this.#turnosDineroNegativo = 0;
        this.#ultimoEventoMigracion = {
            emigracion: { total: 0, infelicidad: 0, desempleo: 0, sinVivienda: 0, crisis: 0, mensajes: [] },
            inmigracion: { total: 0, mensajes: [] },
            mensajes: []
        };
    }

    // ─── API pública ──────────────────────────────────────────────────────────

    /**
     * Ejecuta la lógica de ciudadanos por turno con el orden HU-14:
     * 1) Emigración, 2) crecimiento natural, 3) inmigración,
     * 4) asignación de vivienda/empleo, 5) recalcular felicidad.
     */
    procesarTurno() {
        const { ciudad } = this.#juego;
        const { celdas }  = ciudad.mapa;

        const resumenEmigracion = this._procesarEmigracion(celdas, ciudad);
        this._crearCiudadanos(celdas, ciudad);
        const resumenInmigracion = this._procesarInmigracion(celdas, ciudad);
        this._asignarViviendas(celdas, ciudad);
        this._asignarEmpleos(celdas, ciudad);
        this._actualizarFelicidades(celdas, ciudad);

        this.#ultimoEventoMigracion = {
            emigracion: resumenEmigracion,
            inmigracion: resumenInmigracion,
            mensajes: [
                ...(resumenEmigracion?.mensajes || []),
                ...(resumenInmigracion?.mensajes || [])
            ]
        };

        return this.#ultimoEventoMigracion;
    }

    obtenerResumenMigracionTurno() {
        return {
            emigracion: { ...(this.#ultimoEventoMigracion?.emigracion || {}) },
            inmigracion: { ...(this.#ultimoEventoMigracion?.inmigracion || {}) },
            mensajes: [...(this.#ultimoEventoMigracion?.mensajes || [])]
        };
    }

    /**
     * Devuelve estadísticas de población para mostrar en UI.
     * @returns {{ total: number, empleados: number, desempleados: number, felicidadPromedio: number }}
     */
    obtenerEstadisticas() {
        const { ciudad } = this.#juego;
        const {ciudadanos} = ciudad;
        const total       = ciudadanos.length;
        const empleados   = ciudad.obtenerTotalEmpleados();
        const desempleados = ciudad.obtenerTotalDesempleados();
        const felicidadPromedio = total === 0
            ? 0
            : this.obtenerFelicidadPromedio(ciudadanos);

        return { total, empleados, desempleados, felicidadPromedio };
    }

    actualizarConfiguracion(configParcial = {}) {
        if (!configParcial || typeof configParcial !== "object") {
            return;
        }

        const nuevaConfig = { ...this.#config, ...configParcial };

        if (!Number.isFinite(nuevaConfig.minCrecimiento) || !Number.isFinite(nuevaConfig.maxCrecimiento)) {
            throw new Error("minCrecimiento y maxCrecimiento deben ser numericos");
        }

        if (!Number.isInteger(nuevaConfig.minCrecimiento) || !Number.isInteger(nuevaConfig.maxCrecimiento)) {
            throw new Error("minCrecimiento y maxCrecimiento deben ser enteros");
        }

        if (nuevaConfig.minCrecimiento < 0 || nuevaConfig.maxCrecimiento < 0) {
            throw new Error("minCrecimiento y maxCrecimiento deben ser mayores o iguales a 0");
        }

        if (nuevaConfig.minCrecimiento > nuevaConfig.maxCrecimiento) {
            throw new Error("minCrecimiento no puede ser mayor que maxCrecimiento");
        }

        this.#config = nuevaConfig;
    }

    // ─── Métodos internos

    _crearCiudadanos(celdas, ciudad) {
        const capacidadLibre = this._calcularCapacidadResidencialLibre(celdas, ciudad);
        if (capacidadLibre <= 0) return;

        const vacantesReales = this.#config.requerirEmpleoDisponible
            ? this._calcularVacantesLaboralesReales(celdas, ciudad)
            : Number.POSITIVE_INFINITY;

        if (this.#config.requerirEmpleoDisponible && vacantesReales <= 0) return;

        // Caso borde HU-13: ciudad vacía puede iniciar primera ola si hay vivienda + empleo.
        const totalCiudadanos = ciudad.ciudadanos.length;
        if (totalCiudadanos > 0) {
            const felicidadPromedio = this.obtenerFelicidadPromedio(ciudad.ciudadanos);
            if (felicidadPromedio <= this.#config.umbralFelicidadCrecimiento) return;
        }

        // Limitar creación por capacidad residencial y vacantes laborales reales.
        const limitePorCapacidadYEmpleo = Math.min(capacidadLibre, vacantesReales);
        const maxEfectivo = Math.min(limitePorCapacidadYEmpleo, this.#config.maxCrecimiento);
        if (maxEfectivo <= 0) return;

        const minEfectivo = Math.min(this.#config.minCrecimiento, maxEfectivo);
        const cantidad    = this._aleatorioEntre(minEfectivo, maxEfectivo);

        for (let i = 0; i < cantidad; i++) {
            this.#contadorId++;
            ciudad.agregarCiudadano(new Ciudadano({
                id:        `c-${this.#contadorId}`,
                nombre:    `Ciudadano ${this.#contadorId}`,
                felicidad: 100      // felicidad inicial máxima; se ajusta al final del turno
            }));
        }
    }

    _asignarViviendas(celdas, ciudad) {
        const sinVivienda = ciudad.obtenerCiudadanosSinVivienda();
        for (const ciudadano of sinVivienda) {
            const edificio = this._buscarEdificioResidencialConEspacio(celdas);
            if (!edificio) break;
            edificio.agregarResidente(ciudadano);
            ciudadano.vivienda = edificio;
        }
    }

    _asignarEmpleos(celdas, ciudad) {
        const desempleados = ciudad.obtenerCiudadanosDesempleados();
        for (const ciudadano of desempleados) {
            const edificio = this._buscarEdificioProductivoConEspacio(celdas);
            if (!edificio) break;
            edificio.agregarEmpleado(ciudadano);
            ciudadano.empleo = edificio;
        }
    }

    _procesarEmigracion(_celdas, ciudad) {
        const cfg = this.#config;
        const resultado = {
            total: 0,
            infelicidad: 0,
            desempleo: 0,
            sinVivienda: 0,
            crisis: 0,
            mensajes: []
        };

        const procesados = new Set();

        const porInfelicidad = ciudad.ciudadanos.filter(
            (ciudadano) => ciudadano.felicidad < cfg.umbralFelicidadEmigrar
        );

        for (const ciudadano of porInfelicidad) {
            if (procesados.has(ciudadano)) continue;
            this._removerCiudadano(ciudad, ciudadano);
            procesados.add(ciudadano);
            resultado.infelicidad++;
            resultado.total++;
        }

        const porDesempleo = ciudad.ciudadanos.filter(
            (ciudadano) => (ciudadano.turnosDesempleado || 0) > cfg.maxTurnosDesempleado
        );

        for (const ciudadano of porDesempleo) {
            if (procesados.has(ciudadano)) continue;
            this._removerCiudadano(ciudad, ciudadano);
            procesados.add(ciudadano);
            resultado.desempleo++;
            resultado.total++;
        }

        const porSinVivienda = ciudad.ciudadanos.filter(
            (ciudadano) => (ciudadano.turnosSinVivienda || 0) > cfg.maxTurnosSinVivienda
        );

        for (const ciudadano of porSinVivienda) {
            if (procesados.has(ciudadano)) continue;
            this._removerCiudadano(ciudad, ciudadano);
            procesados.add(ciudadano);
            resultado.sinVivienda++;
            resultado.total++;
        }

        if (this._hayCrisisEconomica(ciudad.economia)) {
            const ciudadanosActuales = ciudad.ciudadanos;
            const cantidadCrisis = Math.floor(
                ciudadanosActuales.length * (cfg.porcentajeEmigranCrisis / 100)
            );
            const seleccionados = this._obtenerMuestraAleatoria(ciudadanosActuales, cantidadCrisis);

            for (const ciudadano of seleccionados) {
                if (procesados.has(ciudadano)) continue;
                this._removerCiudadano(ciudad, ciudadano);
                procesados.add(ciudadano);
                resultado.crisis++;
                resultado.total++;
            }
        }

        if (resultado.infelicidad > 0) {
            resultado.mensajes.push(
                `❌ ${resultado.infelicidad} ciudadanos emigraron por infelicidad`
            );
        }

        if (resultado.desempleo > 0) {
            resultado.mensajes.push(
                `❌ ${resultado.desempleo} ciudadanos emigraron por desempleo prolongado`
            );
        }

        if (resultado.sinVivienda > 0) {
            resultado.mensajes.push(
                `❌ ${resultado.sinVivienda} ciudadanos emigraron sin encontrar hogar`
            );
        }

        if (resultado.crisis > 0) {
            resultado.mensajes.push(
                `⚠️ CRISIS: ${resultado.crisis} ciudadanos emigraron por colapso económico`
            );
        }

        return resultado;
    }

    _procesarInmigracion(celdas, ciudad) {
        const cfg = this.#config;
        const capacidadLibre = this._calcularCapacidadResidencialLibre(celdas, ciudad);
        const capacidadTotal = capacidadLibre + ciudad.ciudadanos.length;

        if (capacidadLibre <= 0 || capacidadTotal <= 0) {
            return { total: 0, mensajes: [] };
        }

        const felicidadPromedio = ciudad.ciudadanos.length === 0
            ? 0
            : this.obtenerFelicidadPromedio(ciudad.ciudadanos);

        const cumpleFelicidad = felicidadPromedio >= cfg.umbralFelicidadInmigrar;
        const cumpleDinero = (ciudad.economia?.dinero || 0) >= cfg.dineroMinimoInmigracion;
        const ratioLibre = capacidadLibre / capacidadTotal;
        const cumpleCapacidad = ratioLibre >= cfg.capacidadResidualLibreMin;

        if (!cumpleFelicidad || !cumpleDinero || !cumpleCapacidad) {
            return { total: 0, mensajes: [] };
        }

        const maxPorEspacio = Math.min(cfg.inmigrantesMax, capacidadLibre);
        if (maxPorEspacio <= 0) {
            return { total: 0, mensajes: [] };
        }

        const minEfectivo = Math.min(cfg.inmigrantesMin, maxPorEspacio);
        const cantidad = this._aleatorioEntre(minEfectivo, maxPorEspacio);

        for (let i = 0; i < cantidad; i++) {
            this.#contadorId++;
            ciudad.agregarCiudadano(new Ciudadano({
                id: `c-${this.#contadorId}`,
                nombre: `Ciudadano ${this.#contadorId}`,
                felicidad: 60
            }));
        }

        return {
            total: cantidad,
            mensajes: [`✅ ${cantidad} nuevos ciudadanos inmigraron`]
        };
    }

    _actualizarFelicidades(celdas, ciudad) {
        const numServicios = this._calcularServiciosEfectivos(celdas, ciudad.economia);
        const numParques   = this._contarCeldas(celdas, SUBTIPOS_PARQUES);
        const { economia } = ciudad;

        for (const ciudadano of ciudad.ciudadanos) {
            if (ciudadano.empleo) {
                ciudadano.turnosDesempleado = 0;
            } else {
                ciudadano.turnosDesempleado = (ciudadano.turnosDesempleado || 0) + 1;
            }

            if (ciudadano.vivienda) {
                ciudadano.turnosSinVivienda = 0;
            } else {
                ciudadano.turnosSinVivienda = (ciudadano.turnosSinVivienda || 0) + 1;
            }

            const hObj = this._calcularFelicidadObjetivo(
                ciudadano, numServicios, numParques, economia
            );
            // Convergencia suave: el α% de la distancia al objetivo por turno
            const hNueva = Math.round(
                Math.min(100, Math.max(0,
                    ciudadano.felicidad + this.#config.alpha * (hObj - ciudadano.felicidad)
                ))
            );
            ciudadano.felicidad = hNueva;
        }
    }

    /**
     * Fórmula completa de felicidad objetivo:
     *   H_obj = clamp(0,100, BASE + B_viv + B_emp + B_serv + B_parq + P_rec)
     * El resultado es la "meta" hacia la que converge la felicidad real (con α).
     */
    _calcularFelicidadObjetivo(ciudadano, numServicios, numParques, economia) {
        const cfg = this.#config;
        let hObj  = cfg.BASE_FELICIDAD;

        hObj += ciudadano.vivienda ? cfg.BONO_VIVIENDA : cfg.PENALIZACION_VIVIENDA;
        hObj += ciudadano.empleo   ? cfg.BONO_EMPLEO   : cfg.PENALIZACION_EMPLEO;
        hObj += cfg.BONO_SERVICIO  * Math.min(numServicios, cfg.MAX_SERVICIOS);
        hObj += cfg.BONO_PARQUE    * Math.min(numParques,   cfg.MAX_PARQUES);

        if (economia.agua         <= 0) hObj += cfg.PENALIZACION_RECURSO;
        if (economia.electricidad <= 0) hObj += cfg.PENALIZACION_RECURSO;

        return Math.min(100, Math.max(0, hObj));
    }

    _calcularServiciosEfectivos(celdas, economia) {
        const cantidadPolicia = this._contarCeldas(celdas, SUBTIPOS_POLICIA);
        const cantidadBomberos = this._contarCeldas(celdas, SUBTIPOS_BOMBEROS);
        const cantidadHospital = this._contarCeldas(celdas, SUBTIPOS_HOSPITAL);

        const tieneElectricidad = (economia.electricidad || 0) > 0;
        const tieneAgua = (economia.agua || 0) > 0;

        const factorPoliciaBomberos = tieneElectricidad ? 1 : 0;
        let factorHospital = 0;
        if (tieneElectricidad && tieneAgua) {
            factorHospital = 1;
        } else if (tieneElectricidad || tieneAgua) {
            factorHospital = 0.5;
        }

        return (
            (cantidadPolicia * factorPoliciaBomberos) +
            (cantidadBomberos * factorPoliciaBomberos) +
            (cantidadHospital * factorHospital)
        );
    }

    /**
     * Capacidad total del mapa menos ciudadanos existentes.
     * Garantiza que nunca creemos más ciudadanos de los que caben.
     */
    _calcularCapacidadResidencialLibre(celdas, ciudad) {
        let capacidadTotal = 0;
        for (const fila of celdas) {
            for (const subtipo of fila) {
                const tipo = SUBTIPOS_RESIDENCIAL.get(subtipo);
                if (tipo) capacidadTotal += tipo.capacidad;
            }
        }
        return capacidadTotal - ciudad.ciudadanos.length;
    }

    /**
     * Vacantes efectivas para crear nuevos ciudadanos:
     * (vacantes laborales actuales) - (desempleados actuales)
     */
    _calcularVacantesLaboralesReales(celdas, ciudad) {
        let capacidadLaboralTotal = 0;

        for (const fila of celdas) {
            for (const subtipo of fila) {
                const tipoComercial = SUBTIPOS_COMERCIAL.get(subtipo);
                if (tipoComercial) {
                    capacidadLaboralTotal += tipoComercial.empleos;
                    continue;
                }

                const tipoIndustrial = SUBTIPOS_INDUSTRIAL.get(subtipo);
                if (tipoIndustrial) {
                    capacidadLaboralTotal += tipoIndustrial.empleos;
                }
            }
        }

        const empleadosActuales = ciudad.obtenerTotalEmpleados();
        const vacantesLaborales = Math.max(0, capacidadLaboralTotal - empleadosActuales);
        const desempleadosActuales = ciudad.obtenerTotalDesempleados();

        return Math.max(0, vacantesLaborales - desempleadosActuales);
    }

    /**
     * Busca el primer EdificioResidencial del mapa que tenga espacio libre.
     * Usa el registro interno para reutilizar instancias entre turnos.
     */
    _buscarEdificioResidencialConEspacio(celdas) {
        for (let y = 0; y < celdas.length; y++) {
            for (let x = 0; x < celdas[y].length; x++) {
                const subtipo = celdas[y][x];
                const tipo    = SUBTIPOS_RESIDENCIAL.get(subtipo);
                if (!tipo) continue;

                const edificio = this._obtenerOCrearEdificio(
                    `${y}-${x}`, subtipo,
                    () => new EdificioResidencial(`edificio-${y}-${x}`, tipo)
                );
                if (edificio.cantidadResidentes < edificio.obtenerCapacidad()) {
                    return edificio;
                }
            }
        }
        return null;
    }

    /**
     * Busca el primer edificio Productivo (comercial o industrial) con empleo disponible.
     */
    _buscarEdificioProductivoConEspacio(celdas) {
        for (let y = 0; y < celdas.length; y++) {
            for (let x = 0; x < celdas[y].length; x++) {
                const subtipo = celdas[y][x];

                if (SUBTIPOS_COMERCIAL.has(subtipo)) {
                    const tipo     = SUBTIPOS_COMERCIAL.get(subtipo);
                    const edificio = this._obtenerOCrearEdificio(
                        `${y}-${x}`, subtipo,
                        () => new EdificioComercial(`edificio-${y}-${x}`, tipo)
                    );
                    if (edificio.cantidadEmpleados < tipo.empleos) return edificio;

                } else if (SUBTIPOS_INDUSTRIAL.has(subtipo)) {
                    const tipo     = SUBTIPOS_INDUSTRIAL.get(subtipo);
                    const edificio = this._obtenerOCrearEdificio(
                        `${y}-${x}`, subtipo,
                        () => new EdificioIndustrial(`edificio-${y}-${x}`, tipo)
                    );
                    if (edificio.cantidadEmpleados < tipo.empleos) return edificio;
                }
            }
        }
        return null;
    }

    /**
     * Devuelve la instancia del registro para una celda, o la crea si:
     *   - no existía, o
     *   - el subtipo cambió (p. ej. se demolió y construyó otro edificio).
     */
    _obtenerOCrearEdificio(clave, subtipo, factory) {
        const existente = this.#registroEdificios.get(clave);
        if (existente && existente.subtipo === subtipo) return existente;
        const nuevo = factory();
        this.#registroEdificios.set(clave, nuevo);
        return nuevo;
    }

    _contarCeldas(celdas, subtiposSet) {
        let count = 0;
        for (const fila of celdas) {
            for (const subtipo of fila) {
                if (subtiposSet.has(subtipo)) count++;
            }
        }
        return count;
    }

    _removerCiudadano(ciudad, ciudadano) {
        if (ciudadano.vivienda) {
            ciudadano.vivienda.removerResidente(ciudadano);
            ciudadano.vivienda = null;
        }

        if (ciudadano.empleo) {
            ciudadano.empleo.removerEmpleado(ciudadano);
            ciudadano.empleo = null;
        }

        ciudad.removerCiudadano(ciudadano);
    }

    _hayCrisisEconomica(economia) {
        if ((economia?.dinero || 0) <= 0) {
            this.#turnosDineroNegativo += 1;
        } else {
            this.#turnosDineroNegativo = 0;
        }

        return this.#turnosDineroNegativo >= this.#config.dineroNegativoTurnosMax;
    }

    _obtenerMuestraAleatoria(lista, cantidad) {
        if (!Array.isArray(lista) || cantidad <= 0) {
            return [];
        }

        const copia = [...lista];
        for (let i = copia.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copia[i], copia[j]] = [copia[j], copia[i]];
        }

        return copia.slice(0, Math.min(cantidad, copia.length));
    }

    _aleatorioEntre(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _obtenerMaxIdCiudadano() {
        const ids = this.#juego.ciudad.ciudadanos
            .map((ciudadano) => String(ciudadano.id ?? ""))
            .map((id) => {
                const match = /^c-(\d+)$/.exec(id);
                return match ? Number(match[1]) : 0;
            });

        if (ids.length === 0) {
            return 0;
        }

        return Math.max(...ids);
    }

    obtenerFelicidadPromedio(ciudadanos){
    return Math.round(
        ciudadanos.reduce((sum, c) => sum + c.felicidad, 0) / ciudadanos.length
    );
}
}
