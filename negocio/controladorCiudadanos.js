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
    umbralFelicidadCrecimiento: 60,
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
    PENALIZACION_RECURSO: -20   // se aplica por recurso (agua / electricidad) en 0
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
    }

    // ─── API pública ──────────────────────────────────────────────────────────

    /**
     * Ejecuta toda la lógica de ciudadanos para un turno:
        * 1. Crea ciudadanos si se cumplen reglas de crecimiento (vivienda/felicidad/empleo).
     * 2. Asigna vivienda a sin hogar (incluye recién creados).
     * 3. Asigna empleo a desempleados.
     * 4. Recalcula felicidad con la fórmula completa.
     */
    procesarTurno() {
        const { ciudad } = this.#juego;
        const { celdas }  = ciudad.mapa;

        this._crearCiudadanos(celdas, ciudad);
        this._asignarViviendas(celdas, ciudad);
        this._asignarEmpleos(celdas, ciudad);
        this._actualizarFelicidades(celdas, ciudad);
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

    _actualizarFelicidades(celdas, ciudad) {
        const numServicios = this._calcularServiciosEfectivos(celdas, ciudad.economia);
        const numParques   = this._contarCeldas(celdas, SUBTIPOS_PARQUES);
        const { economia } = ciudad;

        for (const ciudadano of ciudad.ciudadanos) {
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
