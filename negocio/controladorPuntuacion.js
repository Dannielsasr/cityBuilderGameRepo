import { TipoComercial, TipoIndustrial, TipoServicio, TipoUtilidad, TipoResidencial } from "../modelos/Enums.js";

// import { controladorCiudadanos } from "./controladorCiudadanos.js";
export class controladorPuntuacion {
    #juego;
    constructor(juego) {
        this.#juego = juego;
        this.historial = [];
    }

    MAPA_TIPOS = {
        R1: TipoResidencial.CASA,
        R2: TipoResidencial.APARTAMENTO,

        S1: TipoServicio.ESTACION_POLICIA,
        S2: TipoServicio.ESTACION_BOMBEROS,
        S3: TipoServicio.HOSPITAL,

        U1: TipoUtilidad.PLANTA_ELECTRICA,
        U2: TipoUtilidad.PLANTA_AGUA,

        C1: TipoComercial.TIENDA,
        C2: TipoComercial.CENTRO_COMERCIAL,

        I1: TipoIndustrial.FABRICA,
        I2: TipoIndustrial.GRANJA
    };

    calcularPuntuacion() {
        const {ciudad} = this.#juego;

        const poblacion = ciudad.ciudadanos.length;
        const felicidadPromedio = this._calcularFelicidadPromedio(ciudad.ciudadanos); //estos metodos ya se tienen en otros modulos...
        const {dinero} = ciudad.economia;

        const edificios = this._contarEdificios(ciudad.mapa.celdas);

        const balances = this._calcularBalances(ciudad.mapa.celdas);

        const balanceElectricidad = balances.electricidad;
        const balanceAgua = balances.agua;

        const bonificaciones = this._calcularBonificaciones(ciudad);
        const penalizaciones = this._calcularPenalizaciones(ciudad);

        const puntuacionBase =
            (poblacion * 10) +
            (felicidadPromedio * 5) +
            (dinero / 100) +
            (edificios * 50) +
            (balanceElectricidad * 2) +
            (balanceAgua * 2);
        

        const puntuacion = Math.round(puntuacionBase + bonificaciones - penalizaciones);

        const desglose = {
            poblacion: poblacion * 10,
            felicidad: felicidadPromedio * 5,
            dinero: dinero / 100,
            edificios: edificios * 50,
            recursos: (balanceElectricidad * 2) + (balanceAgua * 2),
            bonificaciones,
            penalizaciones,
            puntuacion
        };

        this._guardarHistorial(puntuacion);

        return desglose;
    }

    _calcularFelicidadPromedio(ciudadanos) {
        if (ciudadanos.length === 0) return 0;

        const total = ciudadanos.reduce((acc, c) => acc + c.felicidad, 0);
        return total / ciudadanos.length;
    }

    _contarEdificios(celdas) {
        let total = 0;

        celdas.forEach(fila => {
            fila.forEach(celda => {
                if (this.MAPA_TIPOS[celda]) {
                    total++;
                }
            });
        });

        return total;
    }

    _calcularBonificaciones(ciudad) {
        let bonus = 0;

        const {ciudadanos} = ciudad;
        const balances = this._calcularBalances(ciudad.mapa.celdas);

        const balanceElectricidad = balances.electricidad;
        const balanceAgua = balances.agua;

        const todosEmpleados = ciudadanos.every(c => c.empleo !== null);
        const felicidad = this._calcularFelicidadPromedio(ciudadanos);

        if (todosEmpleados && ciudadanos.length > 0) bonus += 500;
        if (felicidad > 80) bonus += 300;
        if (balanceElectricidad > 0 && balanceAgua > 0) bonus += 200;
        if (ciudadanos.length > 1000) bonus += 1000;

        return bonus;
    }

    _calcularPenalizaciones(ciudad) {
        let penalty = 0;

        const balances = this._calcularBalances(ciudad.mapa.celdas);

        const balanceElectricidad = balances.electricidad;
        const balanceAgua = balances.agua;

        const {ciudadanos, economia} = ciudad;

        const felicidad = this._calcularFelicidadPromedio(ciudadanos);

        if (economia.dinero < 0) penalty += 500;
        if (balanceElectricidad < 0) penalty += 300;
        if (balanceAgua < 0) penalty += 300;
        if (felicidad < 40) penalty += 400;

        const desempleados = ciudadanos.filter(c => !c.empleo).length;
        penalty += desempleados * 10;

        return penalty;
    }

    _guardarHistorial(score) {
        this.historial.push({
            turno: this.#juego.ciudad.turnoActual,
            score
        });
    }

    _calcularBalances(celdas) {
    let prodElec = 0;
    let consElec = 0;
    let prodAgua = 0;
    let consAgua = 0;
    let tipo = null;

    celdas.forEach(fila => {
        fila.forEach(celda => { 
            if(celda === "U1" || celda === "U2"){
                tipo = this.MAPA_TIPOS[celda];
                if (tipo.tipoProduccion === "ELECTRICIDAD") {
                    prodElec += tipo.produccionPorTurno;
                }
                if (tipo.tipoProduccion === "AGUA") {
                    prodAgua += tipo.produccionPorTurno;
                }
                consElec += tipo.consumoElectricidad || 0;
                consAgua += tipo.consumoAgua || 0;
            }
        });
    });

    return {
        electricidad: prodElec - consElec,
        agua: prodAgua - consAgua
    };
}
}