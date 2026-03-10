import { Juego } from "../modelos/Juego.js";
import { Ciudad } from "../modelos/Ciudad.js";
import { Mapa } from "../modelos/Mapa.js";
import { Economia } from "../modelos/Economia.js";
import { Via } from "../modelos/Via.js";

const btnConstruirVia =  document.getElementById("btnConstruirVia");
const btnDemoler =  document.getElementById("btnDemoler");
const mapaDiv = document.getElementById("mapa");


let juego;

window.addEventListener("DOMContentLoaded", iniciarJuego);

function iniciarJuego() {
    const idCiudad = localStorage.getItem("ciudadActual");
    const data = JSON.parse(localStorage.getItem(idCiudad));

    const mapa = new Mapa(Number(data.mapa.ancho), Number(data.mapa.largo));
    //restaurar las celdas del mapa a partir de los datos guardados en localStorage
    mapa.celdas = data.mapa.celdas;

    const economia = new Economia(data.economia);
    const ciudad = new Ciudad({
        nombre: data.nombre,
        region: data.region,
        mapa,
        economia
    });

    juego = new Juego({ ciudad });
    
    nombreCiudad.textContent = juego.ciudad.nombre;

    renderizarCiudad();
    // iniciarTurnos();
}

function renderizarCiudad(){
    mapaDiv.innerHTML = "";

    //entra a ciudad, mapa, y finalmente sus celdas para renderizarlo en el DOM, sea asigna a la variable celdas
    const { ciudad: { mapa: { celdas } } } = juego;

    const ancho = celdas[0].length;
    mapaDiv.style.gridTemplateColumns = `repeat(${ancho}, 1fr)`;

    celdas.forEach((fila, y) => {

        fila.forEach((celda, x) => {

            const div = document.createElement("div");
            div.classList.add("celda");

            //obtener las coordenadas de cada celda para luego poder colocar elementos en el mapa
            div.dataset.x = x;
            div.dataset.y = y;

            div.setAttribute("subtype", celda);

            mapaDiv.appendChild(div);

        });

    });
}

btnConstruirVia.addEventListener("click", function(){
    document.body.style.cursor = "crosshair";
    mapaDiv.addEventListener("click", construirVia);
    // document.body.style.cursor = "default";
});

function construirVia(event) {

    if(!event.target.classList.contains("celda")) return;

    const {x, y} = event.target.dataset;

    const via = new Via(Date.now() + Math.random());

    const {economia} = juego.ciudad;

    const celdaActual = juego.ciudad.mapa.celdas[y][x];

    if(celdaActual !== "g"){
        alert("Ya existe un elemento en esta celda");
        return;
    }

    if(economia.dinero < via.costo){
        alert("No hay dinero suficiente para construir esta vía");
        return;
    }

    economia.dinero -= via.costo;

    juego.ciudad.mapa.celdas[y][x] = via.subtipo;

    renderizarCiudad();

    guardarCiudad();

    // salir del modo construir
    document.body.style.cursor = "default";
    mapaDiv.removeEventListener("click", construirVia);
}

//guarda la ciudad actualizada en local storage, se llama cada vez que se realiza una acción que modifica el estado de la ciudad, como construir o demoler edificios..
function guardarCiudad(){

    const idCiudad = localStorage.getItem("ciudadActual");

    const dataCiudad = {
        idCiudad: juego.ciudad.idCiudad,
        nombre: juego.ciudad.nombre,
        region: juego.ciudad.region,
        mapa: juego.ciudad.mapa,
        economia: juego.ciudad.economia,
        ciudadanos: juego.ciudad.ciudadanos
    };

    localStorage.setItem(idCiudad, JSON.stringify(dataCiudad));
}

