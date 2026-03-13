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

    let consumoElectricidad = 0;
    let consumoAgua = 0;

    let produccionElectricidad = 0;
    let produccionAgua = 0;

    let ingresoTotal = 0;
    let beneficioFelicidadTotal = 0;

	celdas.forEach(fila => {
    fila.forEach(subtipo => {

			if(subtipo === "P1"){
				beneficioFelicidadTotal += 5;
				return;
			}

			const tipo = CONFIG_EDIFICIOS[subtipo];
			if(!tipo) return;

			consumoElectricidad += tipo.consumoElectricidad || 0;
			consumoAgua += tipo.consumoAgua || 0;

			if(tipo.produccionPorTurno){

				if(tipo.tipoProduccion === "ELECTRICIDAD"){
					produccionElectricidad += tipo.produccionPorTurno;
				}

				if(tipo.tipoProduccion === "AGUA"){
					produccionAgua += tipo.produccionPorTurno;
				}

				if(tipo.tipoProduccion === "DINERO"){
					ingresoTotal += tipo.produccionPorTurno;
				}

				if(tipo.tipoProduccion === "ALIMENTOS"){
					economia.alimentos += tipo.produccionPorTurno;
				}

			}

			if(tipo.ingresoPorTurno){
				ingresoTotal += tipo.ingresoPorTurno;
			}

			if(tipo.beneficioFelicidad){
				beneficioFelicidadTotal += tipo.beneficioFelicidad;
			}

		});
	});

    economia.electricidad += produccionElectricidad;
    economia.agua += produccionAgua;
    economia.dinero += ingresoTotal;

    const aplicadoElectricidad = Math.min(economia.electricidad, consumoElectricidad);
    const aplicadoAgua = Math.min(economia.agua, consumoAgua);

    economia.electricidad -= aplicadoElectricidad;
    economia.agua -= aplicadoAgua;

    this.aplicarFelicidadServicios(beneficioFelicidadTotal);

    this.#onActualizacion({
        consumoElectricidad,
        consumoAgua,
        produccionElectricidad,
        produccionAgua,
        ingresoTotal,
        beneficioFelicidadTotal
    });

	}


	aplicarFelicidadServicios(beneficio){

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
