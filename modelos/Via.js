import { ElementoMapa } from "./ElementoMapa.js";

export class Via extends ElementoMapa{
    constructor(id) {
        super({id, costo: 100, costoMantenimiento: 10, subtipo: "r"});
    }

    toJSON() {
        return {
            id: this.id,
            costo: this.costo,
            costoMantenimiento: this.costoMantenimiento,
            subtipo: this.subtipo
        };
    }
}