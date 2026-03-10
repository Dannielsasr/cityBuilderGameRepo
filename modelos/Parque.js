import { ElementoMapa } from "./ElementoMapa.js";

export class Parque extends ElementoMapa{
    #bonoFelicidad = 5; //es constante

    constructor(id) {
        super({id, costo: 1500, costoMantenimiento: 300, subtipo: "P1"});
    }

    get bonoFelicidad() {
        return this.#bonoFelicidad;
    }

    toJSON() {
        return {
            id: this.id,
            costo: this.costo,
            costoMantenimiento: this.costoMantenimiento,
            subtipo: this.subtipo,
            bonoFelicidad: this.bonoFelicidad
        };
    }
}