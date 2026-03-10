import { Mapa } from "./Mapa.js";
import { Economia } from "./Economia.js";
import { Ciudadano } from "./Ciudadano.js";


export class Ciudad {
    #idCiudad;
    #nombre;
    #region;
    #mapa;
    #ciudadanos;
    #economia;

    constructor({ id = Date.now() + Math.random(), nombre = "mi_Ciudad", region, mapa, economia }) {
        this.#idCiudad = id;
        this.nombre = nombre;
        this.region = region; //mediante API region
        this.mapa = mapa;
        this.economia = economia;
        this.#ciudadanos = [];
    }

    get idCiudad() {
        return this.#idCiudad;
    }

    get nombre() {
        return this.#nombre;
    }

    get region() {
        return this.#region;
    }

    get mapa() {
        return this.#mapa;
    }

    get ciudadanos() {
        return [...this.#ciudadanos]; // devuelve copia 
    }

    get economia() {
        return this.#economia;
    }

    set nombre(valor) {
        if (typeof valor !== "string" || valor.trim() === "") {
            throw new Error("Nombre inválido");
        }
        this.#nombre = valor;
    }

    set region(valor) {
        // if (!(valor instanceof Region)) {
        //     throw new Error("Region inválida");
        // } 
        // falta relacionarlo con la API de regiones
        this.#region = valor;
    }

    set mapa(valor) {
        if (!(valor instanceof Mapa)) {
            throw new Error("Mapa inválido");
        }
        this.#mapa = valor;
    }

    set economia(valor) {
        if (!(valor instanceof Economia)) {
            throw new Error("Economia inválida");
        }
        this.#economia = valor;
    }

    agregarCiudadano(ciudadano) {
        if (!(ciudadano instanceof Ciudadano)) {
            throw new Error("Debe ser instancia de Ciudadano");
        }

        this.#ciudadanos.push(ciudadano);
    }
}