export class Economia{

    #dinero;
    #electricidad;
    #agua;
    #alimento;

    constructor({
        dinero = 50000,
        electricidad = 0,
        agua = 0,
        alimento = 0
        }) {
        
        this.dinero = dinero;
        this.electricidad = electricidad;
        this.agua = agua;
        this.alimento = alimento;
    }

    get dinero(){
        return this.#dinero;
    }

    get electricidad(){
        return this.#electricidad;
    }

    get agua(){
        return this.#agua;
    }

    get alimento(){
        return this.#alimento;
    }

    //tener en cuenta que estos atributos tambien tienen un limite
    set dinero(dinero){
        if(dinero < 0){
            throw new Error("El dinero no puede ser negativo");
        }
        this.#dinero = dinero;
    }

    set electricidad(electricidad){
        if(electricidad < 0){
            throw new Error("La electricidad no puede ser negativa");
        }
        this.#electricidad = electricidad;
    }

    set agua(agua){
        if(agua < 0){
            throw new Error("El agua no puede ser negativa");
        }
        this.#agua = agua;
    }

    set alimento(alimento){
        if(alimento < 0){
            throw new Error("El alimento no puede ser negativo");
        }
        this.#alimento = alimento;
    }

    toJSON() {
        return {
            dinero: this.dinero,
            electricidad: this.electricidad,
            agua: this.agua,
            alimento: this.alimento
        };
    }
}