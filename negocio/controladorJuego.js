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


//botones
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

//grid | otros
const mapaDiv = document.getElementById("mapa");
const nombreCiudadTitulo = document.getElementById("nombreCiudad");

//contadores
const contadorResidenciales = document.getElementById("contadorResidenciales");
const contadorComerciales = document.getElementById("contadorComerciales");
const contadorUtilidades = document.getElementById("contadorUtilidades");
const contadorServicios = document.getElementById("contadorServicios");
const contadorIndustriales = document.getElementById("contadorIndustriales");
const contadorParques = document.getElementById("contadorParques");
const contadorVias = document.getElementById("contadorVias");

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

    actualizarContadorElementos();
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
    if(modoConstruccionActivo === MODOS_CONSTRUCCION.NINGUNO) return;
    if (!event.target.classList.contains("celda")) return;

    const x = Number(event.target.dataset.x);
    const y = Number(event.target.dataset.y);

    const celdaActual = juego.ciudad.mapa.celdas[y][x];

    if (celdaActual !== "g") {
        alert("La celda ya está ocupada");
        return;
    }

    // casos especiales
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

    if(!tieneViaAdyacente(x, y)){
        alert("Debe existir una vía adyacente para construir un edificio tipo: " + modoConstruccionActivo);
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


//este metodo simplemente actualiza los contadores de los elementos en pantalla.
function actualizarContadorElementos() {
    if (!contadorResidenciales || !contadorComerciales || !contadorIndustriales || !contadorServicios || !contadorUtilidades || !contadorParques || !contadorVias || !juego) {
        return;
    }

    const {celdas} = juego.ciudad.mapa;

    let casas = 0, esCasa = TipoResidencial.CASA.subtipo;
    let apartamentos = 0, esApartamento = TipoResidencial.APARTAMENTO.subtipo;
    let tiendas = 0, esTienda = TipoComercial.TIENDA.subtipo;
    let malls = 0, esMall = TipoComercial.CENTRO_COMERCIAL.subtipo;
    let fabricas = 0, esFabrica = TipoIndustrial.FABRICA.subtipo;
    let granjas = 0, esGranja = TipoIndustrial.GRANJA.subtipo;
    let policias = 0, esPolicia = TipoServicio.ESTACION_POLICIA.subtipo;
    let bomberos = 0, esBombero = TipoServicio.ESTACION_BOMBEROS.subtipo;
    let hospitales = 0, esHospital = TipoServicio.HOSPITAL.subtipo;
    let plantasElectricidad = 0, esElectrica = TipoUtilidad.PLANTA_ELECTRICA.subtipo;
    let plantasAgua = 0, esAgua = TipoUtilidad.PLANTA_AGUA.subtipo;
    let parques = 0, esParque = "P1";
    let vias = 0, esVia = "r";


    //no es lo mas eficientes debido a que recorre nuevamente el mapa.
    celdas.forEach((fila) => {
        fila.forEach((celda) => {
            if (celda === esCasa) {
                casas += 1;
            }
            if (celda === esApartamento) {
                apartamentos += 1;
            }
            if(celda === esTienda){
                tiendas += 1;
            }
            if(celda === esMall){
                malls += 1;
            }
            if(celda === esFabrica){
                fabricas += 1;
            }
            if(celda === esGranja){
                granjas += 1;
            }
            if(celda === esPolicia){
                policias += 1;
            }
            if(celda === esBombero){
                bomberos += 1;
            }
            if(celda === esHospital){
                hospitales += 1;
            }
            if(celda === esElectrica){
                plantasElectricidad += 1;
            }
            if(celda === esAgua){
                plantasAgua += 1;
            }
            if(celda === esParque){
                parques += 1;
            }
            if(celda === esVia){
                vias += 1;
            }
        });
    });

    const totalResidenciales = casas + apartamentos;
    const totalComeciales = tiendas + malls;
    const totalIndustriales = fabricas + granjas;
    const totalServicios = policias + bomberos + hospitales;
    const totalUtilidades = plantasElectricidad + plantasAgua;

    contadorResidenciales.textContent = `Residenciales: ${totalResidenciales} (Casas: ${casas}, Apartamentos: ${apartamentos})`;
    contadorComerciales.textContent = `Comerciales: ${totalComeciales} (Tiendas: ${tiendas}, Malls: ${malls})`;;
    contadorIndustriales.textContent = `Industriales: ${totalIndustriales} (Fabricas: ${fabricas}, Granjas: ${granjas})`;
    contadorServicios.textContent = `Servicios: ${totalServicios} (Estaciones Policia: ${policias}, Estaciones Bombero: ${bomberos}, Hospitales: ${hospitales})`;
    contadorUtilidades.textContent = `Utilidades: ${totalUtilidades} (Plantas electricas: ${plantasElectricidad}, Plantas agua: ${plantasAgua})`;
    contadorParques.textContent = `parques: ${parques}`;
    contadorVias.textContent = `vias: ${vias}`;
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