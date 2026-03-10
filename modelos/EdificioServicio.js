import { Edificio } from "./Edificio.js";
import { TipoServicio } from "./Enums.js";

export class EdificioServicio extends Edificio {
    #tipo;

    constructor(id, tipo) {
        if (!Object.values(TipoServicio).includes(tipo)) {
            throw new Error("Tipo servicio inválido")
        }

        super({id, costo: tipo.costo, costoMantenimiento: tipo.costoMantenimiento, consumoElectricidad: tipo.consumoElectricidad, consumoAgua: tipo.consumoAgua, subtipo: tipo.subtipo});
        this.#tipo = tipo;
    }

    get tipo() {
        return this.#tipo;
    }
}