import { Productivo } from "./Productivo.js";
import { EdificioResidencial } from "./EdificioResidencial.js";

export class Ciudadano{

    #id;
    #nombre;
    #felicidad
    #vivienda;
    #empleo;

    constructor({
            id,
            nombre,
            felicidad = 100,
            vivienda = null,
            empleo = null
        }) {
        
        this.id = id;
        this.nombre = nombre;
        this.felicidad = felicidad;
        this.vivienda = vivienda;
        this.empleo = empleo;
    }

    get id(){
        return this.#id;
    }
    
    get nombre(){
        return this.#nombre;
    }

    get felicidad(){
        return this.#felicidad;
    }

    get vivienda(){
        return this.#vivienda;
    }

    get empleo(){
        return this.#empleo;
    }

    set id(id){
        this.#id = id;
    }

    set nombre(nombre){
        this.#nombre = nombre;
    }

    set felicidad(felicidad){
        if(felicidad < 0 || felicidad > 100){
            throw new Error("La felicidad debe estar entre 0 y 100");
        }
        this.#felicidad = felicidad;
    }

    set vivienda(vivienda){
        if(vivienda !== null && !(vivienda instanceof EdificioResidencial)){
            throw new Error("La vivienda debe ser una instancia de EdificioResidencial o null");
        }
        this.#vivienda = vivienda;
    }

    set empleo(empleo){
        if(empleo !== null && !(empleo instanceof Productivo)){
            throw new Error("El empleo debe ser una instancia de Productivo o null");
        }
        this.#empleo = empleo;
    }

    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            felicidad: this.felicidad,
            vivienda: this.vivienda ? this.vivienda.id : null,
            empleo: this.empleo ? this.empleo.id : null
        };
    }
}