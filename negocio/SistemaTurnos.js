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

export class SistemaTurnos {
	#juego;
	#onActualizacion;
	#intervalId;

	constructor(juego, onActualizacion) {
		if (!(juego instanceof Juego)) {
			throw new Error("SistemaTurnos requiere una instancia valida de Juego");
		}

		if (typeof onActualizacion !== "function") {
			throw new Error("onActualizacion debe ser una funcion");
		}

		if (!Number.isFinite(juego.tiempoPorTurno) || juego.tiempoPorTurno <= 0) {
			throw new Error("tiempoPorTurno debe ser un numero positivo");
		}

		this.#juego = juego;
		this.#onActualizacion = onActualizacion;
		this.#intervalId = null;
	}

	// Inicia el sistema de turnos, procesando un turno cada tiempoPorTurno segundos
	iniciar() {
		if (this.#intervalId !== null) {
			return;
		}

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
	}

	detener(){
		this.pausar();
	}

	procesarTurno(){

    const { celdas } = this.#juego.ciudad.mapa;
    const { economia } = this.#juego.ciudad;

	let totals = {
		produccionElectricidad: 0,
		produccionAgua: 0,
		consumoElectricidad: 0,
		consumoAgua: 0,
		ingresoTotal: 0,
		beneficioFelicidadTotal: 0,
		mantenimiento: 0
	};

	celdas.forEach(fila => {
		fila.forEach(subtipo => {
			this._procesarCelda(subtipo, economia, totals);
		});
	});

	this._aplicarProduccionYConsumo(economia, totals);
	this._aplicarFelicidadCiudadanos(totals.beneficioFelicidadTotal);
	this._procesarMantenimiento(economia, totals.mantenimiento);

	const balance = (totals.produccionElectricidad + totals.produccionAgua + totals.ingresoTotal) - (totals.consumoElectricidad + totals.consumoAgua);

	this.#onActualizacion({
		consumoElectricidad: totals.consumoElectricidad,
		consumoAgua: totals.consumoAgua,
		produccionElectricidad: totals.produccionElectricidad,
		produccionAgua: totals.produccionAgua,
		ingresoTotal: totals.ingresoTotal,
		beneficioFelicidadTotal: totals.beneficioFelicidadTotal,
		mantenimientoTotal: totals.mantenimiento,
		balance
	});

	}


	_procesarCelda(subtipo, economia, totals){
		if(subtipo === "P1"){
			totals.beneficioFelicidadTotal += 5;
			return;
		}

		const tipo = CONFIG_EDIFICIOS[subtipo];
		if(!tipo) return;

		totals.mantenimiento += tipo.costoMantenimiento || 0;

		totals.consumoElectricidad += tipo.consumoElectricidad || 0;
		totals.consumoAgua += tipo.consumoAgua || 0;

		this._procesarProduccion(tipo, economia, totals);

		if(tipo.beneficioFelicidad){
			totals.beneficioFelicidadTotal += tipo.beneficioFelicidad;
		}
	}

	_procesarProduccion(tipo, economia, totals){
		if(!tipo.produccionPorTurno) return;

		const esEnergia = tipo.tipoProduccion === "ELECTRICIDAD";
		const esAgua = tipo.tipoProduccion === "AGUA";
		const esDinero = tipo.tipoProduccion === "DINERO";
		const esAlimentos = tipo.tipoProduccion === "ALIMENTOS";

		if(esEnergia){
			totals.produccionElectricidad += tipo.produccionPorTurno;
		}

		if(esAgua){
			totals.produccionAgua += tipo.produccionPorTurno;
		}

		const escasezRecursos = economia.agua === 0 || economia.electricidad === 0;
		let produccionActual = tipo.produccionPorTurno;
		if((esDinero || esAlimentos) && escasezRecursos){
			produccionActual *= 0.5;
		}

		if(esDinero){
			totals.ingresoTotal += produccionActual;
		}

		if(esAlimentos){
			economia.alimento = (economia.alimento || 0) + produccionActual;
		}
	}

	_procesarMantenimiento(economia, mantenimientoTotal){
		economia.dinero -= mantenimientoTotal;
	}

	_aplicarProduccionYConsumo(economia, totals){
		//produccion
		economia.electricidad += totals.produccionElectricidad;
		economia.agua += totals.produccionAgua;
		economia.dinero += totals.ingresoTotal;

		//consumo
		const aplicadoElectricidad = Math.min(economia.electricidad, totals.consumoElectricidad);
		const aplicadoAgua = Math.min(economia.agua, totals.consumoAgua);

		economia.electricidad -= aplicadoElectricidad;
		economia.agua -= aplicadoAgua;
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
}