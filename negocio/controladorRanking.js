import { RankingRepository } from "../accesoDatos/RankingRepository.js";
import { CiudadRepository } from "../accesoDatos/CiudadRepository.js";

const rankingRepository = new RankingRepository();
const ciudadRepository = new CiudadRepository();

document.addEventListener("DOMContentLoaded", iniciarRanking);

function iniciarRanking(){

    const ranking = rankingRepository.obtenerRanking();
    const top10 = ranking.slice(0,10);
    const ciudadActual = ciudadRepository.obtenerCiudadActual();

    renderizarTabla(top10, ciudadActual);

    mostrarPosicionJugador(ranking, ciudadActual);

    configurarBotones(ranking);
}

//renderiza dinamicamente el ranking
function renderizarTabla(top10, ciudadActual){
    const tbody = document.getElementById("ranking-body");
    tbody.innerHTML = "";

    top10.forEach((city,index)=>{

        const tr = document.createElement("tr");

        //resalto la ciudad actual si está dentro del top 10
        if(ciudadActual && city.cityId === ciudadActual.idCiudad){
            tr.classList.add("current-city");
        }

        tr.innerHTML = `
            <td>#${index+1}</td>
            <td>${city.cityName}</td>
            <td>${city.mayor}</td>
            <td>${city.score}</td>
            <td>${city.population}</td>
            <td>${city.happiness}%</td>
            <td>${city.turns}</td>
            <td>${formatearFecha(city.date)}</td>
        `;

        tbody.appendChild(tr);

    });
}

//en caso de que no este en el top 10, muestra su posicion.
function mostrarPosicionJugador(ranking, ciudadActual){

    if(!ciudadActual) return;

    const posicion = ranking.findIndex(
        c => c.cityId === ciudadActual.idCiudad
    ) + 1;

    if(posicion > 10){

        const label = document.getElementById("player-ranking");

        label.textContent =
            `Tu ciudad: #${posicion} (${ciudadActual.nombre})`;

    }
}

function configurarBotones(ranking){

    document.getElementById("btn-volver")
        .addEventListener("click",()=>{
            window.location.href = "juego.html";
        });

    document.getElementById("btn-exportar")
        .addEventListener("click",()=>{
            exportarRanking(ranking);
        });

    document.getElementById("btn-reset")
        .addEventListener("click", reiniciarRanking);
}

function exportarRanking(ranking){

    const blob = new Blob(
        [JSON.stringify(ranking,null,2)],
        {type:"application/json"}
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "ranking.json";
    a.click();

    URL.revokeObjectURL(url);
}

function reiniciarRanking(){

    const confirmacion = confirm(
        "¿Seguro que deseas reiniciar el ranking?"
    );

    if(!confirmacion) return;

    // Elimina el estado de ciudades usando la capa de persistencia.
    ciudadRepository.eliminarConfiguracionInicial();

    location.reload();
}

function formatearFecha(date){

    const d = new Date(date);

    return d.toLocaleDateString();
}