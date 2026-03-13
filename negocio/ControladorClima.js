import { ClimaRepositorio } from "../accesoDatos/ClimaRepositorio.js";

const climaRepo = new ClimaRepositorio();

export async function cargarActualizarClima(coords) {
    const clima = await climaRepo.obtenerClimaDesdeAPI(coords.lat, coords.lon);
    if (clima) {
        actualizarWidgetClima(clima);
    }
}

function actualizarWidgetClima(clima) {
    const tempEl = document.getElementById("clima-temp");
    const condEl = document.getElementById("clima-condicion");
    const iconoEl = document.getElementById("clima-icono");
    const humEl = document.getElementById("clima-humedad");
    const vientoEl = document.getElementById("clima-viento");

    if (tempEl) tempEl.textContent = `${clima.temperatura}°C`;
    if (condEl) condEl.textContent = clima.condicion;
    if (iconoEl) iconoEl.src = clima.icono;
    if (humEl) humEl.textContent = `Humedad: ${clima.humedad}%`;
    if (vientoEl) vientoEl.textContent = `Viento: ${clima.viento} m/s`;
}