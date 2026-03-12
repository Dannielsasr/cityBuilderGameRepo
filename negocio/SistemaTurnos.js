import { Juego } from "../modelos/Juego.js";
import { TipoResidencial } from "../modelos/Enums.js";

export class SistemaTurnos {
	#juego;
	#onActualizacion;
	#segundosPorTurno;
	#intervalId;

	constructor(juego, onActualizacion, segundosPorTurno = 10) {
		if (!(juego instanceof Juego)) {
			throw new Error("SistemaTurnos requiere una instancia valida de Juego");
		}

		if (typeof onActualizacion !== "function") {
			throw new Error("onActualizacion debe ser una funcion");
		}

		if (!Number.isFinite(segundosPorTurno) || segundosPorTurno <= 0) {
			throw new Error("segundosPorTurno debe ser un numero positivo");
		}

		this.#juego = juego;
		this.#onActualizacion = onActualizacion;
		this.#segundosPorTurno = segundosPorTurno;
		this.#intervalId = null;
	}

	iniciar() {
		if (this.#intervalId !== null) {
			return;
		}

		this.#intervalId = setInterval(() => {
			this.procesarTurno();
		}, this.#segundosPorTurno * 1000);
	}

	pausar() {
		if (this.#intervalId === null) {
			return;
		}

		clearInterval(this.#intervalId);
		this.#intervalId = null;
	}

	detener() {
		this.pausar();
	}

	procesarTurno() {
		const celdas = this.#juego.ciudad.mapa.celdas;
		const { economia } = this.#juego.ciudad;

		let casas = 0;
		let apartamentos = 0;

		celdas.forEach((fila) => {
			fila.forEach((celda) => {
				if (celda === TipoResidencial.CASA.subtipo) {
					casas += 1;
				} else if (celda === TipoResidencial.APARTAMENTO.subtipo) {
					apartamentos += 1;
				}
			});
		});

		const consumoTeoricoElectricidad =
			casas * TipoResidencial.CASA.consumoElectricidad +
			apartamentos * TipoResidencial.APARTAMENTO.consumoElectricidad;

		const consumoTeoricoAgua =
			casas * TipoResidencial.CASA.consumoAgua +
			apartamentos * TipoResidencial.APARTAMENTO.consumoAgua;

		const consumoAplicadoElectricidad = Math.min(
			economia.electricidad,
			consumoTeoricoElectricidad
		);

		const consumoAplicadoAgua = Math.min(
			economia.agua,
			consumoTeoricoAgua
		);

		economia.electricidad -= consumoAplicadoElectricidad;
		economia.agua -= consumoAplicadoAgua;

		this.#onActualizacion({
			casas,
			apartamentos,
			consumoTeoricoElectricidad,
			consumoTeoricoAgua,
			consumoAplicadoElectricidad,
			consumoAplicadoAgua
		});
	}
}
