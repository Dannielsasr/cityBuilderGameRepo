import { Juego } from "../modelos/Juego.js";
import { Ciudad } from "../modelos/Ciudad.js";
import { Mapa } from "../modelos/Mapa.js";
import { Economia } from "../modelos/Economia.js";
import { Via } from "../modelos/Via.js";
import { TipoResidencial } from "../modelos/Enums.js";
import { CiudadRepository } from "../accesoDatos/CiudadRepository.js";
import { SistemaTurnos } from "./SistemaTurnos.js";

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
    APARTAMENTO: "APARTAMENTO"
});


let juego;
let modoConstruccionActivo = MODOS_CONSTRUCCION.NINGUNO;
let sistemaTurnos;
const ciudadRepository = new CiudadRepository();

window.addEventListener("DOMContentLoaded", iniciarJuego);

btnCasa?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.CASA);
});

btnApartamento?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.APARTAMENTO);
});

btnVia?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.VIA);
});

btnDemoler?.addEventListener("click", function() {
    desactivarModoConstruccion();
});

mapaDiv?.addEventListener("click", manejarClickEnMapa);

function iniciarJuego() {
    const data = ciudadRepository.obtenerCiudadActual();

    if (!data) {
        alert("No existe una ciudad guardada. Crea una ciudad primero.");
        window.location.href = "./formularioCiudad.html";
        return;
    }

    const mapa = new Mapa(Number(data.mapa.ancho), Number(data.mapa.largo));
    mapa.celdas = data.mapa.celdas;

    const economia = new Economia(data.economia);
    const ciudad = new Ciudad({
        id: data.idCiudad,
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

    const ancho = celdas[0].length;
    mapaDiv.style.gridTemplateColumns = `repeat(${ancho}, 1fr)`;

    celdas.forEach((fila, y) => {
        fila.forEach((celda, x) => {

            const div = document.createElement("div");
            div.classList.add("celda");
            div.dataset.x = x;
            div.dataset.y = y;
            div.setAttribute("subtype", celda);

            mapaDiv.appendChild(div);
        });
    });

    actualizarContadorResidenciales();
}

function activarModoConstruccion(modo) {
    modoConstruccionActivo = modo;
    document.body.style.cursor = "crosshair";
}

function desactivarModoConstruccion() {
    modoConstruccionActivo = MODOS_CONSTRUCCION.NINGUNO;
    document.body.style.cursor = "default";
}

function manejarClickEnMapa(event) {
    if (!event.target.classList.contains("celda")) return;

    if (modoConstruccionActivo === MODOS_CONSTRUCCION.NINGUNO) {
        return;
    }

    if (modoConstruccionActivo === MODOS_CONSTRUCCION.VIA) {
        construirVia(event);
        return;
    }

    if (
        modoConstruccionActivo === MODOS_CONSTRUCCION.CASA ||
        modoConstruccionActivo === MODOS_CONSTRUCCION.APARTAMENTO
    ) {
        prepararConstruccionResidencial(event);
    }
}

function prepararConstruccionResidencial(event) {
    const x = Number(event.target.dataset.x);
    const y = Number(event.target.dataset.y);
    const tipoSeleccionado = modoConstruccionActivo;
    const costo = obtenerCostoResidencialPorModo(tipoSeleccionado);
    const subtipo = obtenerSubtipoResidencialPorModo(tipoSeleccionado);
    const { economia } = juego.ciudad;
    const celdaActual = juego.ciudad.mapa.celdas[y][x];

    if (!subtipo) {
        alert("Tipo residencial invalido");
        return;
    }

    if (celdaActual !== "g") {
        alert("No se puede construir: la celda ya esta ocupada");
        return;
    }

    if (economia.dinero < costo) {
        alert("No hay dinero suficiente para construir este edificio residencial");
        return;
    }

    if (!tieneViaAdyacente(x, y)) {
        alert("No se puede construir: debe existir una via adyacente");
        return;
    }

    economia.dinero -= costo;
    juego.ciudad.mapa.celdas[y][x] = subtipo;

    console.log(`Construido ${tipoSeleccionado} en (${x}, ${y}). Costo: ${costo}. Dinero restante: ${economia.dinero}`);
    renderizarCiudad();
    guardarCiudad();
    desactivarModoConstruccion();
}

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

function obtenerCostoResidencialPorModo(modo) {
    if (modo === MODOS_CONSTRUCCION.CASA) {
        return TipoResidencial.CASA.costo;
    }

    if (modo === MODOS_CONSTRUCCION.APARTAMENTO) {
        return TipoResidencial.APARTAMENTO.costo;
    }

    return Number.MAX_SAFE_INTEGER;
}

function obtenerSubtipoResidencialPorModo(modo) {
    if (modo === MODOS_CONSTRUCCION.CASA) {
        return TipoResidencial.CASA.subtipo;
    }

    if (modo === MODOS_CONSTRUCCION.APARTAMENTO) {
        return TipoResidencial.APARTAMENTO.subtipo;
    }

    return null;
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

function construirVia(event) {
    if (!event.target.classList.contains("celda")) return;

    const {x, y} = event.target.dataset;

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


function guardarCiudad(){
    const dataCiudad = {
        idCiudad: String(juego.ciudad.idCiudad),
        nombre: juego.ciudad.nombre,
        region: juego.ciudad.region,
        mapa: juego.ciudad.mapa.toJSON(),
        economia: juego.ciudad.economia.toJSON(),
        ciudadanos: juego.ciudad.ciudadanos,
        poblacion: juego.ciudad.ciudadanos.length
    };

    ciudadRepository.guardarCiudadActual(dataCiudad);
}