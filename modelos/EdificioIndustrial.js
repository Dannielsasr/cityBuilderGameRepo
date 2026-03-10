import { Productivo } from "./Productivo.js";
import { TipoIndustrial } from "./Enums.js";

export class EdificioIndustrial extends Productivo {
    #tipo;

    constructor(id, tipo) {
        if (!Object.values(TipoIndustrial).includes(tipo)) {
            throw new Error("Tipo industrial inválido")
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