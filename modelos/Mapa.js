import { ElementoMapa } from "./ElementoMapa.js";

export class Mapa{

    #ancho;
    #largo;
    #celdas;

    constructor(ancho, largo) {
        this.ancho = ancho;
        this.largo = largo;
        
        //crea un arreglo bidimensional alto * ancho relleno de null
        this.#celdas = Array.from({ length: largo }, () =>
            Array.from({ length: ancho }, () => null)
        );
    }

    get ancho(){
        return this.#ancho;
    }

    get largo(){
        return this.#largo;
    }

    set ancho(valor){
        if(valor < 15 || valor > 30){
            throw new Error("El ancho esta fuera de rango");
        }
        this.#ancho = valor;
    }

    set largo(valor){
        if(valor < 15 || valor > 30){
            throw new Error("El largo esta fuera de rango");
        }
        this.#largo = valor;
    }

    obtenerElemento(x, y){
        this.#validarCoordenadas(x, y);
        return this.#celdas[x][y];
    }

    eliminarElemento(x, y) {
        this.#validarCoordenadas(x, y);
        this.#celdas[y][x] = null;
    }

    colocarElemento(x, y, elemento) {
        this.#validarCoordenadas(x, y);

        if (!(elemento instanceof ElementoMapa)) {
            throw new Error("Debe ser una instancia de ElementoMapa");
        }

        if (this.#celdas[y][x] !== null) {
            throw new Error("La celda ya está ocupada");
        }

        this.#celdas[y][x] = elemento;
    }

    #validarCoordenadas(x, y) {
        if (x < 0 || x >= this.#ancho || y < 0 || y >= this.#largo) {
            throw new Error("Coordenadas fuera del mapa");
        }
    }

    get celdas(){
        return [...this.#celdas];
    }
}