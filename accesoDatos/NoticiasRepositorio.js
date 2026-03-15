export class NoticiasRepositorio {
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
            return datos.articles.slice(0, 5); 
        } catch (error) {
            console.error("Error en NoticiasRepositorio:", error);
            return [];
        }
    }
}