import { Edificio } from "./Edificio.js";
import { TipoResidencial } from "./Enums.js";

export class EdificioResidencial extends Edificio {
    #tipo;
    #residentes;

    constructor(id, tipo) {
        if (!Object.values(TipoResidencial).includes(tipo)) {
            throw new Error("Tipo residencial inválido")
        }

        super(id, tipo.costo, tipo.costoMantenimiento, tipo.consumoElectricidad, tipo.consumoAgua);
        this.#tipo = tipo;
        this.#residentes = [];
    }

    get tipo() {
        return this.#tipo;
    }

    get residentes() {
        return [...this.#residentes];
    }

    obtenerCapacidad() {
        return this.#tipo.capacidad;
    }

    agregarResidente(ciudadano) {
        if (!(ciudadano instanceof Ciudadano)) {
            throw new Error("El residente debe ser un Ciudadano");
        }

        if (this.#residentes.includes(ciudadano)) {
            throw new Error("El ciudadano ya es residente de este edificio");
        }

        this.#residentes.push(ciudadano);
    }

    removerResidente(ciudadano) {
        this.#residentes = this.#residentes.filter(e => e !== ciudadano);
    }

    get cantidadResidentes() {
        return this.#residentes.length;
    }
}