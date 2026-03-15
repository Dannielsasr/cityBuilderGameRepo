export class RutasRepository {

    //se conecta con el backend, y al enviar la peticion(con el mapa, el inicio y el fin), obtiene una respuesta con la ruta.
    static async calcularRuta(map, start, end){

        const response = await fetch("http://127.0.0.1:5000/api/calculate-route", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                map: map,
                start: start,
                end: end
            })
        });

        const data = await response.json();

        if(!response.ok){
            throw new Error(data.error);
        }

        return data.route;
    }

}