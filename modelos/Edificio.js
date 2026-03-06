import { ElementoMapa } from "./ElementoMapa.js";

export class Edificio extends ElementoMapa{

    #consumoElectricidad;
    #consumoAgua;

    constructor(id, costo, costoMantenimiento,
                consumoElectricidad, consumoAgua) {
        super(id, costo, costoMantenimiento);
        this.consumoElectricidad = consumoElectricidad;
        this.consumoAgua = consumoAgua;
    }

    get consumoElectricidad(){
        return this.#consumoElectricidad;
    }

    get consumoAgua(){
        return this.#consumoAgua;
    }

    set consumoElectricidad(consumoElectricidad){
        this.#consumoElectricidad = consumoElectricidad;
    }

    set consumoAgua(consumoAgua){
        this.#consumoAgua = consumoAgua;
    }
}