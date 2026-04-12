import { ClimaRepository } from "../accesoDatos/ClimaRepository.js";

const climaRepo = new ClimaRepository();

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

    if (tempEl) tempEl.textContent = clima.getTemperatura();
    if (condEl) condEl.textContent = clima.getCondicion();
    if (iconoEl) iconoEl.src = clima.getIcono();
    if (humEl) humEl.textContent = clima.getHumedad();
    if (vientoEl) vientoEl.textContent = clima.getViento();
}