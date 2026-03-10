import { Edificio } from "./Edificio.js";
import { TipoUtilidad } from "./Enums.js";

export class PlantaUtilidad extends Edificio {
    #tipo;

    constructor(id, tipo) {
        if (!Object.values(TipoUtilidad).includes(tipo)) {
            throw new Error("Tipo planta utilidad inválido")
        }

        super({id, costo: tipo.costo, costoMantenimiento: tipo.costoMantenimiento, consumoElectricidad: tipo.consumoElectricidad, consumoAgua: tipo.consumoAgua, subtipo: tipo.subtipo});
        this.#tipo = tipo;
    }

    get tipo() {
        return this.#tipo;
    }
}