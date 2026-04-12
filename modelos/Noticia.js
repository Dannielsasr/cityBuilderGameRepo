export class Noticia {
    constructor({ titulo, descripcion, imagen, fecha, url }) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.imagen = imagen;
        this.fecha = fecha;
        this.url = url;
    }

    getTitulo() {
        return this.titulo;
    }

    getDescripcion() {
        return this.descripcion;
    }

    getImagen() {
        return this.imagen;
    }

    getFecha() {
        return this.fecha;
    }

    getUrl() {
        return this.url;
    }

    setTitulo(titulo) {
        this.titulo = titulo;
    }

    setDescripcion(descripcion) {
        this.descripcion = descripcion;
    }

    setImagen(imagen) {
        this.imagen = imagen;
    }

    setFecha(fecha) {
        this.fecha = fecha;
    }

    setUrl(url) {
        this.url = url;
    }
}