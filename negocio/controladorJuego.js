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
import { controladorTurnos } from "./controladorTurnos.js";
import { controladorCiudadanos } from "./controladorCiudadanos.js";
import { TipoComercial, TipoIndustrial, TipoServicio, TipoUtilidad, TipoResidencial } from "../modelos/Enums.js";
import * as Rutas from "./controladorRutas.js";
import { cargarActualizarNoticias } from "./controladorNoticias.js";
import { cargarActualizarClima } from "./controladorClima.js";
import { COORDENADAS_REGIONES } from "../accesoDatos/ClimaRepository.js";

window.addEventListener("DOMContentLoaded", iniciarJuego);

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
const cerrarPanel = document.getElementById("cerrarPanel");
const btnDemolerPanel = document.getElementById("btnDemolerPanel");
const btnPausa = document.getElementById("pausado");
const btnContinuar = document.getElementById("continuar");
const btnReiniciar = document.getElementById("reiniciar");

//grid | otros
const mapaDiv = document.getElementById("mapa");
const nombreCiudadTitulo = document.getElementById("nombreCiudad");
const containerConfig = document.getElementById("container-config");

//contadores

const puntuacion = document.getElementById("puntaje");
const dinero = document.getElementById("dinero");
const totalAgua = document.getElementById("totalAgua");
const totalElectricidad = document.getElementById("totalElectricidad");
const totalAlimento = document.getElementById("totalAlimento");
const promedioFelicidad = document.getElementById("promedioFelicidad");


const contadorResidenciales = document.getElementById("contadorResidenciales");
const contadorComerciales = document.getElementById("contadorComerciales");
const contadorUtilidades = document.getElementById("contadorUtilidades");
const contadorServicios = document.getElementById("contadorServicios");
const contadorIndustriales = document.getElementById("contadorIndustriales");
const contadorParques = document.getElementById("contadorParques");
const contadorVias = document.getElementById("contadorVias");

const contadorCasas = document.getElementById("contadorCasas");
const contadorApartamentos = document.getElementById("contadorApartamentos");

const contadorTiendas = document.getElementById("contadorTiendas");
const contadorMalls = document.getElementById("contadorMalls");

const contadorFabricas = document.getElementById("contadorFabricas");
const contadorGranjas = document.getElementById("contadorGranjas");

const contadorPolicias = document.getElementById("contadorPolicias");
const contadorBomberos = document.getElementById("contadorBomberos");
const contadorHospitales = document.getElementById("contadorHospitales");

const contadorElectricas = document.getElementById("contadorElectricas");
const contadorAgua = document.getElementById("contadorAgua");
const estadisticasCiudadanosLabel = document.getElementById("estadisticasCiudadanos");

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
let modo = "";
let modoConstruccionActivo = MODOS_CONSTRUCCION.NINGUNO;
let sistemaTurnos;
let sistemaCiudadanos;
let edificioSeleccionado = { x: null, y: null };
const ciudadRepository = new CiudadRepository();

document.getElementById("btnExportar").addEventListener("click", exportarCiudadJSON);

document.getElementById("btnRanking").addEventListener("click", () => {
    window.location.href = "/presentacion/vistas/ranking.html";
});


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
    activarModoDemolicion();
});

cerrarPanel?.addEventListener("click", function(){
    document.getElementById("panelEdificio").classList.add("oculto");
});

btnDemolerPanel?.addEventListener("click", function(){

    const confirmar = confirm("¿Seguro que deseas destruir este edificio?");

    if(!confirmar) return;

    destruirElementoDirecto(
        edificioSeleccionado.x,
        edificioSeleccionado.y
    );

    desactivarModos();

    document.getElementById("panelEdificio").classList.add("oculto");

});


mapaDiv?.addEventListener("click", manejarClickMapa);


function configurarEventosPausa() {

    btnPausa?.addEventListener("click", () => {
        console.log("PAUSAR", sistemaTurnos);

        if (!sistemaTurnos) return;

        sistemaTurnos.pausar();
        //agregar oscurecimiento a la pagina
        const overlay = document.createElement("div");
        overlay.classList.add("overlay-pausa");
        document.body.appendChild(overlay);

        containerConfig.classList.add("activo");
        containerConfig.style.display = "block";
    });

    btnContinuar?.addEventListener("click", () => {
        console.log("REANUDAR", sistemaTurnos);

        if (!sistemaTurnos) return;

        sistemaTurnos.reanudar();
        
        document.querySelector(".overlay-pausa")?.remove();
        containerConfig.classList.remove("activo");
        containerConfig.style.display = "none";
    });

    btnReiniciar?.addEventListener("click", () => {
        if (!sistemaTurnos) return;

        const confirmar = confirm("¿Seguro que deseas borrar la ciudad actual?");
        if (!confirmar) return;

        sistemaTurnos.pausar();

        ciudadRepository.eliminarCiudadActual();

        containerConfig.style.display = "none";
        btnPausa.disabled = false;

        window.location.reload();
    });
}

async function iniciarJuego() {
    const data = ciudadRepository.obtenerCiudadActual();

    if (!data) {
        alert("No existe una ciudad guardada. Crea una ciudad primero.");
        window.location.href = "./formularioCiudad.html";
        return;
    }

    const mapa = new Mapa(Number(data.mapa.ancho), Number(data.mapa.largo));
    mapa.celdas = data.mapa.celdas;

    const economia = new Economia(data.economia);
    const ciudadanosPersistidos = Array.isArray(data.ciudadanos) ? data.ciudadanos : [];

    const ciudad = new Ciudad({
        id: data.idCiudad,
        alcalde: data.alcalde,
        nombre: data.nombre,
        region: data.region,
        mapa,
        economia,
        ciudadanos: ciudadanosPersistidos
    });

    juego = new Juego({ ciudad, turnoActual: data.turnoActual ?? 0 });
    rehidratarAsignacionesCiudadanos(ciudadanosPersistidos, juego.ciudad, mapa.celdas);
    nombreCiudadTitulo.textContent = juego.ciudad.nombre;
    //clima
    const coordenadas = COORDENADAS_REGIONES[data.region];
if (coordenadas) {
    cargarActualizarClima(coordenadas); // El controlador se encarga de obtener y actualizar

    setInterval(() => {
        cargarActualizarClima(coordenadas);
    }, 1800000);
}

    cargarActualizarNoticias();
    setInterval(() => {
        cargarActualizarNoticias();
    }, 1800000);

    renderizarCiudad();
    //setteamos para que juego este global en controladorRutas
    Rutas.setJuego(juego);

    sistemaCiudadanos = new controladorCiudadanos(juego);

    sistemaTurnos = new controladorTurnos(
        juego,
        sistemaCiudadanos,
        (alertData) => {
            guardarCiudad();
            renderizarCiudad();

            if (Array.isArray(alertData.alertas) && alertData.alertas.length > 0) {
                alert(alertData.alertas.join("\n"));
            }
        }
    );

    sistemaTurnos.iniciar();
    configurarEventosPausa();
}

function manejarClickMapa(e){

    if (!e.target.classList.contains("celda")) return;

    switch(modo){

        case "construir":
            construirElemento(e);
            break;

        case "demoler":
            destruirElemento(e);
            break;

        default:
            mostrarInfoEdificio(e);
    }
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

    actualizarRecursos(juego);
    actualizarContadorElementos();
    actualizarEstadisticasCiudadanos();
}

//settea el modo y cambia el aspecto del cursor
function activarModoConstruccion(modoConstruir) {
    modo = "construir"
    modoConstruccionActivo = modoConstruir;
    document.body.style.cursor = "crosshair";
}

function desactivarModoConstruccion() {
    modo = "";
    modoConstruccionActivo = MODOS_CONSTRUCCION.NINGUNO;
    document.body.style.cursor = "default";
}

function activarModoDemolicion(){
    modo = "demoler"
    document.body.style.cursor = "";
    document.body.classList.add("cursor-demolicion");
}

function desactivarModoDemolicion(){
    modo = ""; 
    document.body.classList.remove("cursor-demolicion");
}

function desactivarModos(){

    modo = "";

    document.body.style.cursor = "default";

    document.body.classList.remove("cursor-demolicion");
}

function mostrarInfoEdificio(event){
    if(modoSeleccionRuta)return;
    const x = Number(event.target.dataset.x);
    const y = Number(event.target.dataset.y);

    const subtipo = juego.ciudad.mapa.celdas[y][x];

    if(subtipo === "g") return;

    const tipo = obtenerTipoPorSubtipo(subtipo);

    if(!tipo) return;

    // guardar edificio seleccionado
    edificioSeleccionado.x = x;
    edificioSeleccionado.y = y;

    const panel = document.getElementById("panelEdificio");

    document.getElementById("nombreEdificio").textContent = tipo.nombre || subtipo;

    document.getElementById("costoConstruccion").textContent = tipo.costo || 0;

    document.getElementById("costoMantenimiento").textContent = tipo.costoMantenimiento || 0;

    document.getElementById("consumoElectricidad").textContent = tipo.consumoElectricidad || 0;

    document.getElementById("consumoAgua").textContent = tipo.consumoAgua || 0;

    document.getElementById("tipoProduccion").textContent = tipo.tipoProduccion || "N/A";

    document.getElementById("produccion").textContent = tipo.produccionPorTurno || "N/A";

    document.getElementById("capacidad").textContent = tipo.capacidad || "N/A";

    //se debe settear cuando se implemente sistema ciudadanos
    document.getElementById("ocupacion").textContent = "N/A";

    panel.classList.remove("oculto");
}

function liberarAsignacionesPorDemolicion(subtipo, x, y) {
    const idEdificioDemolido = `edificio-${y}-${x}`;

    if (
        subtipo === TipoResidencial.CASA.subtipo ||
        subtipo === TipoResidencial.APARTAMENTO.subtipo
    ) {
        juego.ciudad.ciudadanos.forEach((ciudadano) => {
            const idVivienda = String(ciudadano.vivienda?.id ?? "");
            if (idVivienda === idEdificioDemolido) {
                ciudadano.vivienda = null;
            }
        });
    }

    if (
        subtipo === TipoIndustrial.FABRICA.subtipo ||
        subtipo === TipoIndustrial.GRANJA.subtipo ||
        subtipo === TipoComercial.TIENDA.subtipo ||
        subtipo === TipoComercial.CENTRO_COMERCIAL.subtipo
    ) {
        juego.ciudad.ciudadanos.forEach((ciudadano) => {
            const idEmpleo = String(ciudadano.empleo?.id ?? "");
            if (idEmpleo === idEdificioDemolido) {
                ciudadano.empleo = null;
            }
        });
    }
}

//este metodo aplica la misma demolicion solo que ya no depende del click
function destruirElementoDirecto(x, y){

    const subtipo = juego.ciudad.mapa.celdas[y][x];

    if(subtipo === "g") return;

    let costo = 0;

    if(subtipo === "r"){
        const via = new Via(0);
        costo = via.costo;
    }

    else if(subtipo === "P1"){
        const parque = new Parque(0);
        costo = parque.costo;
    }

    else{
        const tipo = obtenerTipoPorSubtipo(subtipo);
        const edificio = crearEdificio(0, tipo);
        costo = edificio.costo;
    }

    juego.ciudad.economia.dinero += Math.floor(costo * 0.5);

    liberarAsignacionesPorDemolicion(subtipo, x, y);

    juego.ciudad.mapa.celdas[y][x] = "g";

    renderizarCiudad();
    guardarCiudad();
}

function destruirElemento(event){

    const x = Number(event.target.dataset.x);
    const y = Number(event.target.dataset.y);

    const subtipo = juego.ciudad.mapa.celdas[y][x];

    if(subtipo === "g") return;

    const confirmar = confirm("¿Seguro que deseas destruir este elemento?");

    if(!confirmar){
        return;
    }

    let costo = 0;

    if(subtipo === "r"){
        const via = new Via(0);
        costo = via.costo;
    }

    else if(subtipo === "P1"){
        const parque = new Parque(0);
        costo = parque.costo;
    }

    else{
        const tipo = obtenerTipoPorSubtipo(subtipo);
        const edificio = crearEdificio(0, tipo);
        costo = edificio.costo;
        console.log(tipo)
    }

    juego.ciudad.economia.dinero += Math.floor(costo * 0.5);

    liberarAsignacionesPorDemolicion(subtipo, x, y);

    juego.ciudad.mapa.celdas[y][x] = "g";

    renderizarCiudad();
    guardarCiudad();
    desactivarModoDemolicion();
}

function construirElemento(event){
    if(modoConstruccionActivo === MODOS_CONSTRUCCION.NINGUNO) return;

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

function obtenerTipoPorModo(modoConstruir){

    switch(modoConstruir){

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

function obtenerTipoPorSubtipo(subtipo){

    //convierte enums en un solo arreglo
    const todos = [
        ...Object.values(TipoResidencial),
        ...Object.values(TipoComercial),
        ...Object.values(TipoIndustrial),
        ...Object.values(TipoServicio),
        ...Object.values(TipoUtilidad)
    ];

    //busca dentro del arreglo todos el primero que coincida en el subtipo.
    return todos.find(tipo => tipo.subtipo === subtipo);
}

function actualizarRecursos(juego){
    sistemaCiudadanos = new controladorCiudadanos(juego);
    let {ciudadanos} = juego.ciudad;
    puntuacion.textContent = `${juego.puntuacionAcumulada}`;
    dinero.textContent = `${juego.ciudad.economia.dinero}`;
    totalAgua.textContent = `${juego.ciudad.economia.agua}`;
    totalElectricidad.textContent = `${juego.ciudad.economia.electricidad}`;
    totalAlimento.textContent = `${juego.ciudad.economia.alimento}`;
    promedioFelicidad.textContent = `${sistemaCiudadanos.obtenerFelicidadPromedio(ciudadanos)}`;
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
    const totalComerciales = tiendas + malls;
    const totalIndustriales = fabricas + granjas;
    const totalServicios = policias + bomberos + hospitales;
    const totalUtilidades = plantasElectricidad + plantasAgua;

    contadorResidenciales.textContent = `${totalResidenciales}`;
    contadorComerciales.textContent = `${totalComerciales}`;;
    contadorIndustriales.textContent = `${totalIndustriales}`;
    contadorServicios.textContent = `${totalServicios} `;
    contadorUtilidades.textContent = `${totalUtilidades}`;
    contadorParques.textContent = `${parques}`;
    contadorVias.textContent = `${vias}`;

    contadorCasas.textContent = `${casas}`;
    contadorApartamentos.textContent = `${apartamentos}`;

    contadorTiendas.textContent = `${tiendas}`;
    contadorMalls.textContent = `${malls}`;

    contadorFabricas.textContent = `${fabricas}`;
    contadorGranjas.textContent = `${granjas}`;

    contadorPolicias.textContent = `${policias}`;
    contadorBomberos.textContent = `${bomberos}`;
    contadorHospitales.textContent = `${hospitales}`;

    contadorElectricas.textContent = `${plantasElectricidad}`;
    contadorAgua.textContent = `${plantasAgua}`;
}

function actualizarEstadisticasCiudadanos() {
    if (!estadisticasCiudadanosLabel || !juego?.ciudad) {
        return;
    }

    const { ciudadanos } = juego.ciudad;
    const total = ciudadanos.length;
    const noResidentes = juego.ciudad.obtenerCiudadanosSinVivienda().length;
    const residentes = total - noResidentes;
    const empleados = juego.ciudad.obtenerTotalEmpleados();
    const desempleados = juego.ciudad.obtenerTotalDesempleados();
    const felicidadPromedio = total === 0
        ? 0
        : Math.round(ciudadanos.reduce((sum, ciudadano) => sum + ciudadano.felicidad, 0) / total);

    estadisticasCiudadanosLabel.textContent =
        `Ciudadanos: ${total} | Residentes: ${residentes} | No residentes: ${noResidentes} | Empleados: ${empleados} | Desempleados: ${desempleados} | Felicidad promedio: ${felicidadPromedio}%`;
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
    const data = ciudadRepository.obtenerCiudadActual();
    const dataCiudad = {
        idCiudad: String(juego.ciudad.idCiudad),
        alcalde: juego.ciudad.alcalde || data.alcalde,
        nombre: juego.ciudad.nombre,
        region: juego.ciudad.region,
        mapa: juego.ciudad.mapa.toJSON(),
        economia: juego.ciudad.economia.toJSON(),
        ciudadanos: juego.ciudad.ciudadanos,
        poblacion: juego.ciudad.ciudadanos.length,
        turnoActual: juego.turnoActual
    };

    ciudadRepository.guardarCiudadActual(dataCiudad);
}

function rehidratarAsignacionesCiudadanos(ciudadanosPersistidos, ciudad, celdas) {
    // Reconstruye relaciones ciudadano -> vivienda/empleo usando refs guardadas.
    // Se ejecuta al cargar partida para no perder ocupaciones entre recargas.
    if (!Array.isArray(ciudadanosPersistidos) || ciudadanosPersistidos.length === 0) {
        return;
    }

    const { residencialesPorId, productivosPorId } = construirIndiceEdificios(celdas);
    const ciudadanosActuales = ciudad.ciudadanos;
    const ciudadanosPorId = new Map();

    ciudadanosActuales.forEach((ciudadano) => {
        const id = String(ciudadano.id);
        if (!ciudadanosPorId.has(id)) {
            ciudadanosPorId.set(id, []);
        }
        ciudadanosPorId.get(id).push(ciudadano);
    });

    ciudadanosPersistidos.forEach((ciudadanoPersistido, index) => {
        const colaCiudadanos = ciudadanosPorId.get(String(ciudadanoPersistido.id)) ?? [];
        const ciudadano = colaCiudadanos.shift() ?? ciudadanosActuales[index] ?? null;
        if (!ciudadano) {
            return;
        }

        const viviendaRef = normalizarReferenciaPersistida(ciudadanoPersistido.viviendaRef ?? ciudadanoPersistido.vivienda);
        const empleoRef = normalizarReferenciaPersistida(ciudadanoPersistido.empleoRef ?? ciudadanoPersistido.empleo);

        if (viviendaRef && residencialesPorId.has(viviendaRef)) {
            const vivienda = residencialesPorId.get(viviendaRef);
            if (!vivienda.residentes.includes(ciudadano)) {
                vivienda.agregarResidente(ciudadano);
            }
            ciudadano.vivienda = vivienda;
        }

        if (empleoRef && productivosPorId.has(empleoRef)) {
            const empleo = productivosPorId.get(empleoRef);
            if (!empleo.empleados.includes(ciudadano)) {
                empleo.agregarEmpleado(ciudadano);
            }
            ciudadano.empleo = empleo;
        }
    });
}

function construirIndiceEdificios(celdas) {
    // Recorre el mapa y crea un indice por id de coordenada (edificio-y-x).
    // El indice permite resolver refs persistidas sin buscar edificio por edificio cada vez.
    const residencialesPorId = new Map();
    const productivosPorId = new Map();

    celdas.forEach((fila, y) => {
        fila.forEach((subtipo, x) => {
            const id = `edificio-${y}-${x}`;

            if (subtipo === TipoResidencial.CASA.subtipo) {
                residencialesPorId.set(id, new EdificioResidencial(id, TipoResidencial.CASA));
                return;
            }

            if (subtipo === TipoResidencial.APARTAMENTO.subtipo) {
                residencialesPorId.set(id, new EdificioResidencial(id, TipoResidencial.APARTAMENTO));
                return;
            }

            if (subtipo === TipoComercial.TIENDA.subtipo) {
                productivosPorId.set(id, new EdificioComercial(id, TipoComercial.TIENDA));
                return;
            }

            if (subtipo === TipoComercial.CENTRO_COMERCIAL.subtipo) {
                productivosPorId.set(id, new EdificioComercial(id, TipoComercial.CENTRO_COMERCIAL));
                return;
            }

            if (subtipo === TipoIndustrial.FABRICA.subtipo) {
                productivosPorId.set(id, new EdificioIndustrial(id, TipoIndustrial.FABRICA));
                return;
            }

            if (subtipo === TipoIndustrial.GRANJA.subtipo) {
                productivosPorId.set(id, new EdificioIndustrial(id, TipoIndustrial.GRANJA));
            }
        });
    });

    return {
        residencialesPorId,
        productivosPorId
    };
}

function normalizarReferenciaPersistida(value) {
    // Unifica referencias guardadas en distintos formatos (string, number u objeto con id).
    // Si el valor no representa una referencia valida, retorna null.
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === "string" && value.trim() !== "") {
        return value.trim();
    }

    if (typeof value === "number") {
        return String(value);
    }

    if (typeof value === "object" && value.id !== undefined && value.id !== null) {
        return String(value.id);
    }

    return null;
}

//procedimiento que realiza el proceso de exportacion: toma la ciudad actual, construye el formato, lo descarga y notifica.
function exportarCiudadJSON(){

    const ciudad = ciudadRepository.obtenerCiudadActual();

    if(!ciudad){
        alert("No hay una ciudad para exportar");
        return;
    }

    const data = construirJSONCiudad(ciudad);

    descargarJSON(data, ciudad.nombre);

    notificarExportacion();
}


function construirJSONCiudad(ciudad){

    const felicidadPromedio =
        ciudad.ciudadanos.length === 0
        ? 0
        : ciudad.ciudadanos.reduce((acc,actual)=>acc + (actual.felicidad || 0),0)
            / ciudad.ciudadanos.length;

    const buildings = [];
    const roads = [];
    const parks = [];

    ciudad.mapa.celdas.forEach((fila,y)=>{
        fila.forEach((celda,x)=>{

            if(celda === "r"){
                roads.push({x,y});
            }

            else if(celda === "P1"){
                parks.push({x,y});
            }

            else if(celda !== "g"){
                buildings.push({
                    type: celda,
                    x,
                    y
                });
            }

        });
    });

    const coordenadas = COORDENADAS_REGIONES[ciudad.region] || { lat: 0, lon: 0 };

    return {

        cityName: ciudad.nombre,
        mayor: ciudad.alcalde,

        gridSize:{
            width: ciudad.mapa.ancho,
            height: ciudad.mapa.largo
        },

        //todavia nos falta conectarlo con la INFO DE API CLIMA
        coordinates:{
            lat: coordenadas.lat,
            lon: coordenadas.lon
        },

        turn: ciudad.turnoActual,
        score: ciudad.puntuacionAcumulada,

        map: ciudad.mapa.celdas,

        buildings,
        parks,
        roads,

        resources: ciudad.economia,

        citizens: ciudad.ciudadanos,

        population: ciudad.poblacion,

        happiness: Math.round(felicidadPromedio)

    };
}

//descarga el JSON mediante un enlace creado dinamicamente debido a que en 
// el navegador no podemos crear archivos directamente en el disco del usuario por razones de seguridad
function descargarJSON(data, nombreCiudad){

    const fecha = new Date().toISOString().split("T")[0];

    const nombreArchivo =
        `ciudad_${nombreCiudad}_${fecha}.json`;

        //objeto que representa archivo
    const blob = new Blob(
        [JSON.stringify(data,null,2)],
        {type:"application/json"}
    );

    //crea url temporal para posteriormente descargar archivo 
    const url = URL.createObjectURL(blob);

    //crea un elemento html vinculo
    const a = document.createElement("a");

    //redirecciona a la url y asigna nombre de descarga al archivo json
    a.href = url;
    a.download = nombreArchivo;

    document.body.appendChild(a);

    //al link se simula el click para descargar archivo
    a.click();

    //elimina enlace y libera de memoria.
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

function notificarExportacion(){
    alert("Ciudad exportada correctamente");
}
