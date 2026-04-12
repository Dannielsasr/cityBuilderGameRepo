class Clima {
  constructor(tipo, temperatura, humedad) {
    this.tipo = tipo;
    this.temperatura = temperatura;
    this.humedad = humedad;
  }

  getTipo() {
    return this.tipo;
  }

  getTemperatura() {
    return this.temperatura;
  }

  getHumedad() {
    return this.humedad;
  }

  setTipo(tipo) {
    this.tipo = tipo;
  }

  setTemperatura(temperatura) {
    this.temperatura = temperatura;
  }

  setHumedad(humedad) {
    this.humedad = humedad;
  }

  toString() {
    return `Clima: ${this.tipo}, Temperatura: ${this.temperatura}°C, Humedad: ${this.humedad}%`;
  }
}

module.exports = Clima;
