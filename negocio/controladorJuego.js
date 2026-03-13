import { Juego } from "../modelos/Juego.js";
import { Ciudad } from "../modelos/Ciudad.js";
import { Mapa } from "../modelos/Mapa.js";
import { Economia } from "../modelos/Economia.js";
import { Via } from "../modelos/Via.js";
import { EdificioResidencial } from "../modelos/EdificioResidencial.js";
import { EdificioComercial } from "../modelos/EdificioComercial.js";
import { EdificioIndustrial } from "../modelos/EdificioIndustrial.js";
import { EdificioServicio } from "../modelos/EdificioServicio.js";
import { PlantaUtilidad } from "../modelos/PlantaUtilidad.js";
import { Parque } from "../modelos/Parque.js";
import { CiudadRepository } from "../accesoDatos/CiudadRepository.js";
import { SistemaTurnos } from "./SistemaTurnos.js";
import { TipoComercial, TipoIndustrial, TipoServicio, TipoUtilidad, TipoResidencial } from "../modelos/Enums.js";


const btnCasa = document.getElementById("itemCasa");
const btnApartamento = document.getElementById("itemApartamento");
const btnTienda = document.getElementById("itemTienda");
const btnMall = document.getElementById("itemMall");
const btnFabrica = document.getElementById("itemFabrica");
const btnGranja = document.getElementById("itemGranja");
const btnPolicia = document.getElementById("itemPolicia");
const btnBomberos = document.getElementById("itemBomberos");
const btnHospital = document.getElementById("itemHospital");
const btnPlantaElectrica = document.getElementById("itemElectrica");
const btnPlantaAgua = document.getElementById("itemAgua");
const btnParque = document.getElementById("itemParque");

const btnVia =  document.getElementById("itemVia");
const btnDemoler =  document.getElementById("btnDemoler");
const mapaDiv = document.getElementById("mapa");
const nombreCiudadTitulo = document.getElementById("nombreCiudad");
const contadorResidenciales = document.getElementById("contadorResidenciales");

const MODOS_CONSTRUCCION = Object.freeze({
    NINGUNO: "NINGUNO",
    VIA: "VIA",
    CASA: "CASA",
    APARTAMENTO: "APARTAMENTO",
    TIENDA: "TIENDA",
    MALL: "MALL",
    FABRICA: "FABRICA",
    GRANJA: "GRANJA",
    POLICIA: "POLICIA",
    BOMBEROS: "BOMBEROS",
    HOSPITAL: "HOSPITAL",
    PLANTA_ELECTRICA: "PLANTA_ELECTRICA",
    PLANTA_AGUA: "PLANTA_AGUA",
    PARQUE: "PARQUE"
});


let juego;
let modoConstruccionActivo = MODOS_CONSTRUCCION.NINGUNO;
let sistemaTurnos;
const ciudadRepository = new CiudadRepository();

window.addEventListener("DOMContentLoaded", iniciarJuego);

//esta parte es para captar los eventos, en caso de que algun boton se oprima, se redirecciona.
btnCasa?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.CASA);
});

btnApartamento?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.APARTAMENTO);
});

btnVia?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.VIA);
});

btnTienda?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.TIENDA);
}
);
btnMall?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.MALL);
}
);
btnFabrica?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.FABRICA);
}
);

btnGranja?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.GRANJA);
}
);

btnPolicia?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.POLICIA);
}
);

btnBomberos?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.BOMBEROS);
}
);

btnHospital?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.HOSPITAL);
}
);

btnPlantaElectrica?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.PLANTA_ELECTRICA);
}
);

btnPlantaAgua?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.PLANTA_AGUA);
}
);

btnParque?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.PARQUE);
}
);

btnDemoler?.addEventListener("click", function() {
    desactivarModoConstruccion();
});


mapaDiv?.addEventListener("click", construirElemento);

function iniciarJuego() {
    const idCiudad = localStorage.getItem("ciudadActual");
    const data = JSON.parse(localStorage.getItem(idCiudad));

    const mapa = new Mapa(Number(data.mapa.ancho), Number(data.mapa.largo));
    mapa.celdas = data.mapa.celdas;

    const economia = new Economia(data.economia);
    const ciudad = new Ciudad({
        nombre: data.nombre,
        region: data.region,
        mapa,
        economia
    });

    juego = new Juego({ ciudad });
    nombreCiudadTitulo.textContent = juego.ciudad.nombre;

    renderizarCiudad();

    sistemaTurnos = new SistemaTurnos(
        juego,
        () => {
            guardarCiudad();
            renderizarCiudad();
        }
    );

    sistemaTurnos.iniciar();
}

function renderizarCiudad() {
    mapaDiv.innerHTML = "";

    const { ciudad: { mapa: { celdas } } } = juego;
    console.log("Renderizando ciudad con celdas:", celdas);

    const ancho = celdas[0].length;
    mapaDiv.style.gridTemplateColumns = `repeat(${ancho}, 1fr)`;

    celdas.forEach((fila, y) => {
        fila.forEach((celda, x) => {

            const div = document.createElement("div");
            div.classList.add("celda");
            div.dataset.x = x;
            div.dataset.y = y;
            console.log(`Renderizando celda en (${x}, ${y}) con valor:`, celda);
            div.setAttribute("subtype", celda);

            mapaDiv.appendChild(div);
        });
    });

    actualizarContadorResidenciales();
}

//settea el modo y cambia el aspecto del cursor
function activarModoConstruccion(modo) {
    modoConstruccionActivo = modo;
    document.body.style.cursor = "crosshair";
}

function desactivarModoConstruccion() {
    modoConstruccionActivo = MODOS_CONSTRUCCION.NINGUNO;
    document.body.style.cursor = "default";
}

function construirElemento(event){

    if (!event.target.classList.contains("celda")) return;

    const x = Number(event.target.dataset.x);
    const y = Number(event.target.dataset.y);

    const celdaActual = juego.ciudad.mapa.celdas[y][x];

    if (celdaActual !== "g") {
        alert("La celda ya está ocupada");
        return;
    }

    // casos especiales primero
    if (modoConstruccionActivo === MODOS_CONSTRUCCION.VIA) {
        construirVia(event, x, y);
        return;
    }

    if (modoConstruccionActivo === MODOS_CONSTRUCCION.PARQUE) {
        construirParque(x, y);
        return;
    }

    const tipo = obtenerTipoPorModo(modoConstruccionActivo);

    if(!tipo){
        console.error("Modo sin tipo:", modoConstruccionActivo);
        return;
    }

    const edificio = crearEdificio(Date.now() + Math.random(), tipo);

    if(!edificio){
        console.error("No se pudo crear edificio para tipo:", tipo);
        return;
    }

    const { economia } = juego.ciudad;

    if(economia.dinero < edificio.costo){
        alert("No hay dinero suficiente");
        return;
    }

    if(
        (tipo === TipoResidencial.CASA || tipo === TipoResidencial.APARTAMENTO)
        && !tieneViaAdyacente(x, y)
    ){
        alert("Debe existir una vía adyacente para construir un edificio residencial");
        return;
    }

    economia.dinero -= edificio.costo;

    juego.ciudad.mapa.celdas[y][x] = edificio.subtipo;

    renderizarCiudad();
    guardarCiudad();
    desactivarModoConstruccion();
}

function crearEdificio(id, tipo){

    if (Object.values(TipoResidencial).includes(tipo)) {
        return new EdificioResidencial(id, tipo);
    }

    if (Object.values(TipoComercial).includes(tipo)) {
        return new EdificioComercial(id, tipo);
    }

    if (Object.values(TipoIndustrial).includes(tipo)) {
        return new EdificioIndustrial(id, tipo);
    }

    if (Object.values(TipoServicio).includes(tipo)) {
        return new EdificioServicio(id, tipo);
    }

    if (Object.values(TipoUtilidad).includes(tipo)) {
        return new PlantaUtilidad(id, tipo);
    }

    return null;
}


function obtenerTipoPorModo(modo){

    switch(modo){

        case MODOS_CONSTRUCCION.CASA:
            return TipoResidencial.CASA;

        case MODOS_CONSTRUCCION.APARTAMENTO:
            return TipoResidencial.APARTAMENTO;

        case MODOS_CONSTRUCCION.TIENDA:
            return TipoComercial.TIENDA;

        case MODOS_CONSTRUCCION.MALL:
            return TipoComercial.CENTRO_COMERCIAL;

        case MODOS_CONSTRUCCION.FABRICA:
            return TipoIndustrial.FABRICA;

        case MODOS_CONSTRUCCION.GRANJA:
            return TipoIndustrial.GRANJA;

        case MODOS_CONSTRUCCION.POLICIA:
            return TipoServicio.ESTACION_POLICIA;

        case MODOS_CONSTRUCCION.BOMBEROS:
            return TipoServicio.ESTACION_BOMBEROS;

        case MODOS_CONSTRUCCION.HOSPITAL:
            return TipoServicio.HOSPITAL;

        case MODOS_CONSTRUCCION.PLANTA_ELECTRICA:
            return TipoUtilidad.PLANTA_ELECTRICA;

        case MODOS_CONSTRUCCION.PLANTA_AGUA:
            return TipoUtilidad.PLANTA_AGUA;

        default:
            return null;
    }
}


//recordar actualizar contadores de todos los elementos, no solo de residenciales (esto es solo una prueba)
function actualizarContadorResidenciales() {
    if (!contadorResidenciales || !juego) {
        return;
    }

    const {celdas} = juego.ciudad.mapa;
    let casas = 0;
    let apartamentos = 0;

    celdas.forEach((fila) => {
        fila.forEach((celda) => {
            if (celda === TipoResidencial.CASA.subtipo) {
                casas += 1;
            } else if (celda === TipoResidencial.APARTAMENTO.subtipo) {
                apartamentos += 1;
            }
        });
    });

    const total = casas + apartamentos;
    contadorResidenciales.textContent = `Residenciales: ${total} (Casas: ${casas}, Apartamentos: ${apartamentos})`;
}

function tieneViaAdyacente(x, y) {
    const {celdas} = juego.ciudad.mapa;
    const maxY = celdas.length;
    const maxX = celdas[0].length;

    const vecinos = [
        [x, y - 1],
        [x, y + 1],
        [x - 1, y],
        [x + 1, y]
    ];

    return vecinos.some(([vecinoX, vecinoY]) => {
        if (vecinoX < 0 || vecinoY < 0 || vecinoX >= maxX || vecinoY >= maxY) {
            return false;
        }

        return celdas[vecinoY][vecinoX] === "r";
    });
}

function construirVia(event, x, y) {
    if (!event.target.classList.contains("celda")) return;

    const via = new Via(Date.now() + Math.random());
    const { economia } = juego.ciudad;
    const celdaActual = juego.ciudad.mapa.celdas[y][x];

    if (celdaActual !== "g") {
        alert("Ya existe un elemento en esta celda");
        return;
    }

    if (economia.dinero < via.costo) {
        alert("No hay dinero suficiente para construir esta via");
        return;
    }

    economia.dinero -= via.costo;
    juego.ciudad.mapa.celdas[y][x] = via.subtipo;


    renderizarCiudad();
    guardarCiudad();
    desactivarModoConstruccion();
}


function construirParque(x, y){

    const parque = new Parque(Date.now() + Math.random());
    const { economia } = juego.ciudad;

    const celdaActual = juego.ciudad.mapa.celdas[y][x];

    if (celdaActual !== "g") {
        alert("Ya existe un elemento en esta celda");
        return;
    }

    if(economia.dinero < parque.costo){
        alert("No hay dinero suficiente para construir el parque");
        return;
    }

    economia.dinero -= parque.costo;

    juego.ciudad.mapa.celdas[y][x] = parque.subtipo;

    renderizarCiudad();
    guardarCiudad();
    desactivarModoConstruccion();
}


function guardarCiudad(){
    const dataGuardada = ciudadRepository.obtenerConfiguracionInicial();

    if (dataGuardada && dataGuardada.ciudad) {
        dataGuardada.ciudad.mapa.celdas = juego.ciudad.mapa.celdas;
        dataGuardada.ciudad.recursosIniciales = juego.ciudad.economia.toJSON();
        dataGuardada.ciudad.poblacion = juego.ciudad.ciudadanos.length;

        ciudadRepository.guardarConfiguracion(dataGuardada);
    }

    const idCiudad = localStorage.getItem("ciudadActual");
    if (!idCiudad) {
        return;
    }

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