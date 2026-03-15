import { Edificio } from "./Edificio.js";
import { Ciudadano } from "./Ciudadano.js";

export class Productivo extends Edificio{
    #empleados;

    constructor({
        id,
        costo,
        costoMantenimiento,
        consumoElectricidad,
        consumoAgua,
        subtipo
    }) {
    super({
        id,
        costo,
        costoMantenimiento,
        consumoElectricidad,
        consumoAgua,
        subtipo
    });

    this.#empleados = [];
}

    get empleados() {
        return [...this.#empleados];
    }

    agregarEmpleado(ciudadano) {
        if (!(ciudadano instanceof Ciudadano)) {
            throw new Error("El empleado debe ser un Ciudadano");
        }

        if (this.#empleados.includes(ciudadano)) {
            throw new Error("El ciudadano ya trabaja en este edificio");
        }

        this.#empleados.push(ciudadano);
    }

    removerEmpleado(ciudadano) {
        this.#empleados = this.#empleados.filter(e => e !== ciudadano);
    }

    get cantidadEmpleados() {
        return this.#empleados.length;
    }
}