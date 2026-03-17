import { TipoEstado } from "./Enums.js";
import { Ciudad } from "./Ciudad.js";

export class Juego{

    #ciudad;
    #turnoActual;
    #estado;
    #puntuacionAcumulada;
    #tiempoPorTurno;

    constructor({
        ciudad,
        tiempoPorTurno = 30,
        turnoActual = 1,
        estado = TipoEstado.INICIADO,
        puntuacionAcumulada = 0
    }) {
        // usa setters
        this.ciudad = ciudad;
        this.turnoActual = turnoActual;
        this.estado = estado;
        this.puntuacionAcumulada = puntuacionAcumulada;
        this.tiempoPorTurno = tiempoPorTurno;
    }

    get ciudad() {
        return this.#ciudad;
    }

    get turnoActual() {
        return this.#turnoActual;
    }

    get estado() {
        return this.#estado;
    }

    get puntuacionAcumulada() {
        return this.#puntuacionAcumulada;
    }

    get tiempoPorTurno(){
        return this.#tiempoPorTurno;
    }

    set ciudad(valor){
        if(!(valor instanceof Ciudad)){
            throw new Error("El atributo ciudad debe ser instancia de Ciudad");
        }
        this.#ciudad = valor;
    }

    set turnoActual(valor){
        if(valor < 0){
            throw new Error("El turno actual es negativo");
        }
        this.#turnoActual = valor
    }

    set puntuacionAcumulada(valor){
        if(valor < 0){
            throw new Error("La puntuacion es negativa");
        }
        this.#puntuacionAcumulada = valor
    }

    set tiempoPorTurno(valor){
        if(valor < 0){
            throw new Error("el tiempo por turno es negativo");
        }
        this.#tiempoPorTurno = valor
    }

    set estado(valor){
        if(!Object.values(TipoEstado).includes(valor)){
            throw new Error("estado invalido");
        }
        this.#estado = valor
    }

    toJSON() {
        return {
            ciudad: this.ciudad,
            turnoActual: this.turnoActual,
            estado: this.estado,
            puntuacionAcumulada: this.puntuacionAcumulada,
            tiempoPorTurno: this.tiempoPorTurno
        };
    }

}