import { Productivo } from "./Productivo.js";
import { TipoComercial } from "./Enums.js";

export class EdificioComercial extends Productivo {
    #tipo;

    constructor(id, tipo) {
        if (!Object.values(TipoComercial).includes(tipo)) {
            throw new Error("Tipo comercial inválido")
        }

        super({id, costo: tipo.costo, costoMantenimiento: tipo.costoMantenimiento, consumoElectricidad: tipo.consumoElectricidad, consumoAgua: tipo.consumoAgua, subtipo: tipo.subtipo});
        this.#tipo = tipo;
    }

    get tipo() {
        return this.#tipo;
    }

    obtenerCantidadEmpleos() {
        return this.#tipo.empleos;
    }
}