import { ElementoMapa } from "./ElementoMapa.js";

class Parque extends ElementoMapa{
    #bonoFelicidad = 5; //es constante

    constructor(id) {
        super(id, 1500, 300);
    }

    get bonoFelicidad() {
        return this.#bonoFelicidad;
    }
}