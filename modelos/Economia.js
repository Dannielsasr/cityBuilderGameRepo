export class Economia{

    #dinero;
    #electricidad;
    #agua;
    #alimento;

    constructor({
        dinero = 500000,
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
        this.#dinero = dinero;
    }

    set electricidad(electricidad){
        this.#electricidad = electricidad;
    }

    set agua(agua){
        this.#agua = agua;
    }

    set alimento(alimento){
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