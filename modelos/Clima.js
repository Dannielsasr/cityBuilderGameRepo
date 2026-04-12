export class Clima {
    constructor({ temperatura, condicion, humedad, viento, icono }) {
        this.temperatura = temperatura;
        this.condicion = condicion;
        this.humedad = humedad;
        this.viento = viento;
        this.icono = icono;
    }

    getTemperatura() {
        return `${this.temperatura}°C`;
    }

    getCondicion() {
        return this.condicion;
    }

    getHumedad() {
        return `Humedad: ${this.humedad}%`;
    }

    getViento() {
        return `Viento: ${this.viento} m/s`;
    }

    getIcono() {
        return this.icono;
    }
}