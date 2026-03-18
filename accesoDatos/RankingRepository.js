import { CiudadRepository } from "./CiudadRepository.js";


//este
export class RankingRepository {

    #ciudadRepo;

    constructor(ciudadRepo = new CiudadRepository()) {
        this.#ciudadRepo = ciudadRepo;
    }

    obtenerRanking() {

        const ciudades = this.#ciudadRepo.obtenerCiudades();

        const ranking = ciudades.map(ciudad => {

            const felicidadPromedio =
                ciudad.ciudadanos.length === 0
                ? 0
                : ciudad.ciudadanos.reduce((acc,c)=>acc + (c.felicidad || 0),0)
                    / ciudad.ciudadanos.length;

            return {
                cityId: ciudad.idCiudad,
                cityName: ciudad.nombre,
                mayor: ciudad.alcalde,
                score: ciudad.puntuacionAcumulada || 0, //juego es quien tiene la puntuacion
                population: ciudad.poblacion,
                happiness: Math.round(felicidadPromedio),
                turns: ciudad.turnoActual,
                date: ciudad.updatedAt
            };

        });

        //organiza el ranking de forma descendente (mayor -> menor)
        ranking.sort((a,b)=> b.score - a.score);

        return ranking;
    }

}