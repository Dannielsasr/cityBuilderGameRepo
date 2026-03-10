import { ElementoMapa } from "./ElementoMapa.js";

export class Mapa{

    #ancho;
    #largo;
    #celdas;

    constructor(ancho, largo) {
        this.ancho = ancho;
        this.largo = largo;
        
        //crea un arreglo bidimensional alto * ancho relleno de "g" que indica el subtipo grass
        this.#celdas = Array.from({ length: largo }, () =>
            Array.from({ length: ancho }, () => "g")
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

    set celdas(valor){
        if(!Array.isArray(valor) || valor.length !== this.#largo || valor.some(fila => !Array.isArray(fila) || fila.length !== this.#ancho)){
            throw new Error("Celdas debe ser un arreglo bidimensional con las dimensiones del mapa");
        }
        this.#celdas = valor;
    }

    toJSON() {
        return {
            ancho: this.ancho,
            largo: this.largo,
            celdas: this.celdas
        };
    }
}