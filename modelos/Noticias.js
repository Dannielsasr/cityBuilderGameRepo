class Noticias {
  constructor(id, titulo, contenido, fecha, autor) {
    this.id = id;
    this.titulo = titulo;
    this.contenido = contenido;
    this.fecha = fecha;
    this.autor = autor;
  }

  obtenerDetalles() {
    return {
      id: this.id,
      titulo: this.titulo,
      contenido: this.contenido,
      fecha: this.fecha,
      autor: this.autor
    };
  }

  actualizar(titulo, contenido, autor) {
    this.titulo = titulo;
    this.contenido = contenido;
    this.autor = autor;
  }

  toString() {
    return `Noticia: ${this.titulo} - Autor: ${this.autor}`;
  }
}

module.exports = Noticias;
