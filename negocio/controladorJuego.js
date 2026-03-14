import { Juego } from "../modelos/Juego.js";
import { Ciudad } from "../modelos/Ciudad.js";
import { Mapa } from "../modelos/Mapa.js";
import { Economia } from "../modelos/Economia.js";
import { Via } from "../modelos/Via.js";
import { TipoResidencial } from "../modelos/Enums.js";
import { CiudadRepository } from "../accesoDatos/CiudadRepository.js";
import { SistemaTurnos } from "./SistemaTurnos.js";

const itemCasa = document.getElementById("itemCasa");
const itemApartamento = document.getElementById("itemApartamento");
const btnConstruirVia =  document.getElementById("btnConstruirVia");
const btnDemoler =  document.getElementById("btnDemoler");
const mapaDiv = document.getElementById("mapa");
const nombreCiudadTitulo = document.getElementById("nombreCiudad");
const contadorResidenciales = document.getElementById("contadorResidenciales");

const COORDENADAS_REGIONES = { //solo la ciudad mas imoirtante de cada region(no se donde va cali dicen que pacifico y andina)
    "1": { lat: 4.6097, lon: -74.0817 }, // Andina (Bogotá)
    "2": { lat: 10.9685, lon: -74.7813 }, // Caribe (Barranquilla)
    "3": { lat: 5.6947, lon: -76.6611 },  // Pacífica (Quibdó)
    "4": { lat: 4.1420, lon: -73.6266 },  // Orinoquía (Villavicencio)
    "5": { lat: -4.2153, lon: -69.9406 }  // Amazonía (Leticia)
};

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

itemCasa?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.CASA);
});

itemApartamento?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.APARTAMENTO);
});

btnConstruirVia?.addEventListener("click", function() {
    activarModoConstruccion(MODOS_CONSTRUCCION.VIA);
});

btnDemoler?.addEventListener("click", function() {
    desactivarModoConstruccion();
});

mapaDiv?.addEventListener("click", manejarClickEnMapa);

async function iniciarJuego() {
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

    const coordenadas = COORDENADAS_REGIONES[data.region];
    if (coordenadas) {
        const clima = await obtenerClima(coordenadas.lat, coordenadas.lon);
        if (clima) {
            actualizarWidgetClima(clima);
            setInterval(() => {
                cargarActualizarClima(coordenadas);
            }, 1800000);
        }
    }

    renderizarCiudad();

    sistemaTurnos = new SistemaTurnos(
        juego,
        () => {
            guardarCiudad();
            renderizarCiudad();
        },
        10
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

    renderizarCiudad();
    guardarCiudad();
    desactivarModoConstruccion();
    alert("Edificio residencial construido con exito");
}

function actualizarContadorResidenciales() {
    // Obtenemos las referencias a los nuevos elementos del DOM
    const totalResidencial = document.getElementById('numResidencialTotal');
    const elCasas = document.getElementById('numCasas');
    const elApartamentos = document.getElementById('numApartamentos');

    // Verificación de seguridad
    if (!totalResidencial || !elCasas || !elApartamentos || !juego) {
        return;
    }

    const celdas = juego.ciudad.mapa.celdas;
    let casas = 0;
    let apartamentos = 0;

    // Lógica de conteo (se mantiene igual)
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

    // Actualizamos cada valor por separado
    totalResidencial.textContent = total;
    elCasas.textContent = casas;
    elApartamentos.textContent = apartamentos;
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
    const celdas = juego.ciudad.mapa.celdas;
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

//guarda la ciudad actualizada en local storage, se llama cada vez que se realiza una acción que modifica el estado de la ciudad, como construir o demoler edificios..
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
// Esta función une la lógica de "pedir datos" con "dibujarlos"
async function cargarActualizarClima(coords) {
    const clima = await obtenerClima(coords.lat, coords.lon);
    if (clima) {
        actualizarWidgetClima(clima);
    }
}

async function obtenerClima(lat, lon) {
    const apiKey = 'e23751d05ee5b72f2d4de20d6ae1928d'; // Reemplaza con tu llave
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`;

    try {
        const respuesta = await fetch(url);
        
        
        if (!respuesta.ok) {
            throw new Error('Error al consultar la API');
        }

        const datos = await respuesta.json();
        
        //conseguimos lo que nos pide
        return {
            temperatura: Math.round(datos.main.temp),
            condicion: datos.weather[0].description,
            humedad: datos.main.humidity,
            viento: datos.wind.speed,
            icono: `https://openweathermap.org/img/wn/${datos.weather[0].icon}@2x.png`
        };

    } catch (error) {
        console.error("Hubo un fallo en la integración:", error);
        return null;
    }
}
function actualizarWidgetClima(clima) {
    document.getElementById("clima-temp").textContent = `${clima.temperatura}°C`;
    document.getElementById("clima-condicion").textContent = clima.condicion;
    document.getElementById("clima-icono").src = clima.icono;
    document.getElementById("clima-humedad").textContent = `Humedad: ${clima.humedad}%`;
    document.getElementById("clima-viento").textContent = `Viento: ${clima.viento} m/s`;
}