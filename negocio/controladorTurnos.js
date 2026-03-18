import { Juego } from "../modelos/Juego.js";
import { TipoResidencial, TipoComercial, TipoIndustrial, TipoServicio, TipoUtilidad } from "../modelos/Enums.js";


const CONFIG_EDIFICIOS = {
    R1: TipoResidencial.CASA,
    R2: TipoResidencial.APARTAMENTO,

    C1: TipoComercial.TIENDA,
    C2: TipoComercial.CENTRO_COMERCIAL,

    I1: TipoIndustrial.FABRICA,
    I2: TipoIndustrial.GRANJA,

    S1: TipoServicio.ESTACION_POLICIA,
    S2: TipoServicio.ESTACION_BOMBEROS,
    S3: TipoServicio.HOSPITAL,

    U1: TipoUtilidad.PLANTA_ELECTRICA,
    U2: TipoUtilidad.PLANTA_AGUA
};

const CONFIG_TURNOS_DEFECTO = Object.freeze({
	consumoAlimentoPorCiudadano: 1
});

export class controladorTurnos {
	#juego;
	#controladorCiudadanos;
	#onActualizacion;
	#intervalId;
	#pausado;
	#config;

	constructor(juego, controladorCiudadanos, onActualizacion, config = {}) {
		if (!(juego instanceof Juego)) {
			throw new Error("controladorTurnos requiere una instancia valida de Juego");
		}

		// Compatibilidad: firma anterior constructor(juego, onActualizacion).
		if (typeof controladorCiudadanos === "function" && onActualizacion === undefined) {
			onActualizacion = controladorCiudadanos;
			controladorCiudadanos = null;
		}

		if (typeof onActualizacion !== "function") {
			throw new Error("onActualizacion debe ser una funcion");
		}

		if (
			controladorCiudadanos !== null &&
			controladorCiudadanos !== undefined &&
			typeof controladorCiudadanos.procesarTurno !== "function"
		) {
			throw new Error("controladorCiudadanos debe implementar procesarTurno()");
		}

		if (!Number.isFinite(juego.tiempoPorTurno) || juego.tiempoPorTurno <= 0) {
			throw new Error("tiempoPorTurno debe ser un numero positivo");
		}

		this.#juego = juego;
		this.#controladorCiudadanos = controladorCiudadanos ?? null;
		this.#onActualizacion = onActualizacion;
		this.#intervalId = null;
		this.#pausado = false;
		this.#config = { ...CONFIG_TURNOS_DEFECTO, ...config };
	}

	// Inicia el sistema de turnos, procesando un turno cada tiempoPorTurno segundos
	iniciar() {
		if (this.#intervalId !== null) {
			return;
		}

		this.#pausado = false;

		this.#intervalId = setInterval(() => {
			this.procesarTurno();
		}, this.#juego.tiempoPorTurno * 1000);
	}

	pausar() {
		if (this.#intervalId === null) {
			return;
		}

		clearInterval(this.#intervalId);
		this.#intervalId = null;
		this.#pausado = true;
	}

	reanudar() {
		if (!this.#pausado) {
			return;
		}

		this.iniciar();
	}

	reiniciar() {
    this.pausado = true;

    if (this.intervalo) {
        clearInterval(this.intervalo);
        this.intervalo = null;
    }

    this.#juego.turnoActual = 0;

    this.iniciar();
}

	procesarTurno(){
	if(this.#pausado) return;
	const { ciudad } = this.#juego;
	const { celdas } = ciudad.mapa;
	const { economia } = ciudad;
	const estadoRecursosInicio = this._obtenerEstadoRecursosInicio(economia);

	let totals = {
		produccionElectricidad: 0,
		produccionAgua: 0,
		produccionAlimento: 0,
		consumoElectricidad: 0,
		consumoAgua: 0,
		consumoAlimento: 0,
		ingresoTotal: 0,
		beneficioFelicidadTotal: 0,
		mantenimiento: 0
	};

	// 1) Calcular produccion/consumo por edificios segun reglas operativas.
	celdas.forEach(fila => {
		fila.forEach(subtipo => {
			this._procesarCelda(subtipo, totals, estadoRecursosInicio);
		});
	});

	// 2) Consumo de alimento por ciudadano: poblacion * Z.
	totals.consumoAlimento = ciudad.ciudadanos.length * Math.max(0, this.#config.consumoAlimentoPorCiudadano);

	// 3) Aplicar balance de recursos (produccion - consumo).
	this._aplicarBalanceRecursos(economia, totals);

	// 4) Aplicar mantenimiento.
	this._procesarMantenimiento(economia, totals.mantenimiento);

	// 5) Procesar felicidad y poblacion.
	if (this.#controladorCiudadanos) {
		this.#controladorCiudadanos.procesarTurno();
	} else {
		this._aplicarFelicidadCiudadanos(totals.beneficioFelicidadTotal);
	}

	// 6) Notificaciones.
	const alertas = this._verificarAlertas(economia);

	this.#juego.turnoActual++;

	const balance = (
		totals.produccionElectricidad +
		totals.produccionAgua +
		totals.produccionAlimento +
		totals.ingresoTotal
	) - (
		totals.consumoElectricidad +
		totals.consumoAgua +
		totals.consumoAlimento
	);

	const estadisticasCiudadanos = this.#controladorCiudadanos && typeof this.#controladorCiudadanos.obtenerEstadisticas === "function"
		? this.#controladorCiudadanos.obtenerEstadisticas()
		: null;

	this.#onActualizacion({
		turnoActual: this.#juego.turnoActual,
		consumoElectricidad: totals.consumoElectricidad,
		consumoAgua: totals.consumoAgua,
		consumoAlimento: totals.consumoAlimento,
		produccionElectricidad: totals.produccionElectricidad,
		produccionAgua: totals.produccionAgua,
		produccionAlimento: totals.produccionAlimento,
		ingresoTotal: totals.ingresoTotal,
		beneficioFelicidadTotal: totals.beneficioFelicidadTotal,
		mantenimientoTotal: totals.mantenimiento,
		balance,
		estadisticasCiudadanos,
		alertas
	});
	}


	_procesarCelda(subtipo, totals, estadoRecursosInicio){
		if(subtipo === "P1"){
			totals.beneficioFelicidadTotal += 5;
			return;
		}

		const tipo = CONFIG_EDIFICIOS[subtipo];
		if(!tipo) return;

		totals.mantenimiento += tipo.costoMantenimiento || 0;

		const factorOperacion = this._calcularFactorOperacion(subtipo, estadoRecursosInicio);
		if (factorOperacion <= 0) {
			return;
		}

		totals.consumoElectricidad += (tipo.consumoElectricidad || 0) * factorOperacion;
		totals.consumoAgua += (tipo.consumoAgua || 0) * factorOperacion;

		this._procesarProduccion(tipo, totals, factorOperacion);

		if(tipo.beneficioFelicidad){
			totals.beneficioFelicidadTotal += tipo.beneficioFelicidad * factorOperacion;
		}
	}

	_calcularFactorOperacion(subtipo, estadoRecursosInicio){
		const { electricidadDisponible, aguaDisponible, electricidadSuficientePlantaAgua } = estadoRecursosInicio;

		if (subtipo === "C1" || subtipo === "C2") {
			return electricidadDisponible ? 1 : 0;
		}

		if (subtipo === "U2") {
			return electricidadSuficientePlantaAgua ? 1 : 0;
		}

		if (subtipo === "I1") {
			if (electricidadDisponible && aguaDisponible) return 1;
			if (electricidadDisponible || aguaDisponible) return 0.5;
			return 0;
		}

		if (subtipo === "I2") {
			return aguaDisponible ? 1 : 0;
		}

		if (subtipo === "S1" || subtipo === "S2") {
			return electricidadDisponible ? 1 : 0;
		}

		if (subtipo === "S3") {
			if (electricidadDisponible && aguaDisponible) return 1;
			if (electricidadDisponible || aguaDisponible) return 0.5;
			return 0;
		}

		return 1;
	}

	_obtenerEstadoRecursosInicio(economia){
		const electricidadActual = Number(economia.electricidad) || 0;
		const aguaActual = Number(economia.agua) || 0;
		const consumoPlantaAgua = TipoUtilidad.PLANTA_AGUA.consumoElectricidad || 0;

		return {
			electricidadDisponible: electricidadActual > 0,
			aguaDisponible: aguaActual > 0,
			electricidadSuficientePlantaAgua: electricidadActual >= consumoPlantaAgua
		};
	}

	_procesarProduccion(tipo, totals, factorOperacion){
		if (!tipo.produccionPorTurno && tipo.ingresoPorTurno === undefined) return;

		const esEnergia = tipo.tipoProduccion === "ELECTRICIDAD";
		const esAgua = tipo.tipoProduccion === "AGUA";
		const esDinero = tipo.tipoProduccion === "DINERO";
		const esAlimentos = tipo.tipoProduccion === "ALIMENTOS";
		const produccionActual = (tipo.produccionPorTurno || 0) * factorOperacion;
		const ingresoActual = (tipo.ingresoPorTurno || 0) * factorOperacion;

		if(esEnergia){
			totals.produccionElectricidad += produccionActual;
		}

		if(esAgua){
			totals.produccionAgua += produccionActual;
		}

		if(esDinero){
			totals.ingresoTotal += produccionActual;
		}

		if (ingresoActual > 0) {
			totals.ingresoTotal += ingresoActual;
		}

		if(esAlimentos){
			totals.produccionAlimento += produccionActual;
		}
	}

	_procesarMantenimiento(economia, mantenimientoTotal){
		economia.dinero -= mantenimientoTotal;
	}

	_aplicarBalanceRecursos(economia, totals){
		//produccion
		economia.electricidad += totals.produccionElectricidad;
		economia.agua += totals.produccionAgua;
		economia.alimento = (economia.alimento || 0) + totals.produccionAlimento;
		economia.dinero += totals.ingresoTotal;

		//consumo
		const aplicadoElectricidad = Math.min(economia.electricidad, totals.consumoElectricidad);
		const aplicadoAgua = Math.min(economia.agua, totals.consumoAgua);
		const aplicadoAlimento = Math.min(economia.alimento, totals.consumoAlimento);

		economia.electricidad -= aplicadoElectricidad;
		economia.agua -= aplicadoAgua;
		economia.alimento -= aplicadoAlimento;
	}


	_aplicarFelicidadCiudadanos(beneficio){

		if(!beneficio) return;

		const { ciudadanos } = this.#juego.ciudad;

		ciudadanos.forEach(ciudadano => {

			const nuevaFelicidad = Math.min(
				100,
				ciudadano.felicidad + beneficio
			);

			ciudadano.felicidad = nuevaFelicidad;
		});
	}

	_verificarAlertas(economia){
		const alertas = [];

		if(economia.electricidad === 0){
			alertas.push("¡Alerta! Te has quedado sin electricidad");
		}

		if(economia.agua === 0){
			alertas.push("¡Alerta! Te has quedado sin agua");
		}

		if((economia.alimento || 0) === 0){
			alertas.push("¡Alerta! Te has quedado sin alimentos");
		}

		if(economia.dinero <= 0){
			alertas.push("¡Alerta! Te has quedado sin dinero");
		}

		if(this.#controladorCiudadanos){
			const stats = this.#controladorCiudadanos.obtenerEstadisticas();

			if(stats.felicidadPromedio <= 20){
				alertas.push("😡 Ciudadanos infelices");
			}
		}

		return alertas;
	}
}