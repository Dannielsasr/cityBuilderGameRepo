import { Noticia } from "../modelos/Noticia.js";
export class NoticiasRepository {
    constructor() {
        this.apiKey = 'cef654a6ffa14e18bf4b692f76e40a5c';
        this.baseUrl = 'https://newsapi.org/v2/everything';
    }

    async obtenerNoticiasDesdeAPI() {
        const url = `${this.baseUrl}?q=Colombia&language=es&sortBy=publishedAt&pageSize=5&apiKey=${this.apiKey}`;

        try {
            const respuesta = await fetch(url);
            if (!respuesta.ok) throw new Error('Error al conectar con NewsAPI');
            
            const datos = await respuesta.json();

            //parseo de datos a objetos Noticia
            return datos.articles.map(article => new Noticia({
                titulo: article.title,
                descripcion: article.description || "Sin descripción",
                imagen: article.urlToImage || null,
                fecha: new Date(article.publishedAt),
                url: article.url
            }));
        } catch (error) {
            console.error("Error en NoticiasRepository:", error);
            return [];
        }
    }
}