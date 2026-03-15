import { RutasRepository } from "../accesoDatos/RutasRepository.js";


// Variable global o importada del juego
let juego; // este debe apuntar al objeto Juego que ya tienes
const btnRutas = document.getElementById("btnCalcularRuta");
const mapaDiv = document.getElementById("mapa");

let origen = null;
let destino = null;
let modoSeleccionRuta = false; // modo selección

// Activar modo selección cuando se presiona el botón
btnRutas.addEventListener("click", () => {
    modoSeleccionRuta = true;
    origen = null;
    destino = null;
    alert("Selecciona el edificio de ORIGEN y luego el de DESTINO");
});

// Escuchar clicks en el mapa
mapaDiv?.addEventListener("click", manejarCalculoRuta);

function manejarCalculoRuta(event){
    if(!modoSeleccionRuta) return;

    // Obtenemos la celda clickeada
    const celdaDiv = event.target.closest(".celda");
    if(!celdaDiv) return; // click fuera de celdas

    const x = parseInt(celdaDiv.dataset.x);
    const y = parseInt(celdaDiv.dataset.y);

    if(!origen){
        origen = [y,x];
        celdaDiv.classList.add("origen"); // opcional, para marcar visualmente
        alert(`Origen seleccionado en [${x},${y}]`);
    } else if(!destino){
        destino = [y,x];
        celdaDiv.classList.add("destino"); // opcional, para marcar visualmente
        alert(`Destino seleccionado en [${x},${y}]`);

        // Tenemos ambos, calculamos ruta
        calcularRuta(origen, destino);

        // Limpiamos estado para permitir nueva selección
        origen = null;
        destino = null;
        modoSeleccionRuta = false;

        // Opcional: quitar las clases de marcador después de calcular
        setTimeout(() => {
            document.querySelectorAll(".origen, .destino").forEach(c => c.classList.remove("origen","destino"));
        }, 2000);
    }
}

// Procedimiento principal que calcula la ruta
export async function calcularRuta(origen, destino){

    const map = construirMatrizMapa();

    try{
        const ruta = await RutasRepository.calcularRuta(
            map,
            origen,
            destino
        );

        console.log(ruta);

        pintarRuta(ruta);

    }catch(error){
        alert(error.message);
    }
}

// Construye la matriz de 1s y 0s según las celdas transitables
export function construirMatrizMapa(){

    const { celdas } = juego.ciudad.mapa;

    const matriz = [];

    for(let y = 0; y < celdas.length; y++){

        const fila = [];

        for(let x = 0; x < celdas[y].length; x++){

            const celda = celdas[y][x]; // celda representa el tipo "g" o "r" o ...

            if(celda === "r"){
                fila.push(1);
            }else{
                fila.push(0);
            }

        }
        matriz.push(fila);
    }

    return matriz;
}

// Dada la ruta que obtenemos del backend, pintamos la ruta en el mapa
export function pintarRuta(route){

    // Limpiamos ruta anterior
    document.querySelectorAll(".ruta").forEach(c => c.classList.remove("ruta"));

    //y es fila y x columna
    route.forEach(([y,x])=>{
        const celda = document.querySelector(
            `.celda[data-x="${x}"][data-y="${y}"]`
        );

        if(celda){
            celda.classList.add("ruta");
        }

    });

}

export function setJuego(juegoObj){
    juego = juegoObj;
}