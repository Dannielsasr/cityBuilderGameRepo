import { Productivo } from "./Productivo.js";
import { TipoComercial } from "./Enums.js";

class EdificioComercial extends Productivo {
    #tipo;

    constructor(id, tipo) {
        if (!Object.values(TipoComercial).includes(tipo)) {
            throw new Error("Tipo comercial inválido")
        }

        super(id, tipo.costo, tipo.costoMantenimiento, tipo.consumoElectricidad, tipo.consumoAgua);
        this.#tipo = tipo;
    }

    get tipo() {
        return this.#tipo;
    }

    obtenerCantidadEmpleos() {
        return this.#tipo.empleos;
    }
}