import { Edificio } from "./Edificio.js";
import { TipoUtilidad } from "./Enums.js";

class PlantaUtilidad extends Edificio {
    #tipo;

    constructor(id, tipo) {
        if (!Object.values(TipoUtilidad).includes(tipo)) {
            throw new Error("Tipo planta utilidad inválido")
        }

        super(id, tipo.costo, tipo.costoMantenimiento, tipo.consumoElectricidad, tipo.consumoAgua);
        this.#tipo = tipo;
    }

    get tipo() {
        return this.#tipo;
    }
}