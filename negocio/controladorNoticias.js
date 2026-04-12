import { NoticiasRepository } from "../accesoDatos/NoticiasRepository.js";

const noticiasRepo = new NoticiasRepository();

export async function cargarActualizarNoticias() {
    const articulos = await noticiasRepo.obtenerNoticiasDesdeAPI();
    if (articulos.length > 0) {
        renderizarNoticias(articulos);
    } else {
        console.log("No se recibieron artículos en el controlador.");
    }
}

function renderizarNoticias(articulos) {
    const contenedor = document.getElementById("noticias-contenido");
    if (!contenedor) return;

    contenedor.innerHTML = ""; 

    articulos.forEach(art => {
        const noticiaDiv = document.createElement("article");
        noticiaDiv.className = "noticia-item";

        if (art.getImagen()) {
            const img = document.createElement("img");
            img.src = art.getImagen();
            img.className = "noticia-img";
            noticiaDiv.appendChild(img);
        }

        const titulo = document.createElement("h6");
        titulo.className = "noticia-titulo";
        titulo.textContent = art.getTitulo();
        noticiaDiv.appendChild(titulo);

        const descripcion = document.createElement("p");
        descripcion.className = "noticia-desc";
        descripcion.textContent = art.getDescripcion() || "Sin descripción.";
        noticiaDiv.appendChild(descripcion);

        const footer = document.createElement("div");
        footer.className = "noticia-footer";
        
        const tiempo = document.createElement("span");
        tiempo.textContent = art.getFecha().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const enlace = document.createElement("a");
        enlace.href = art.getUrl();
        enlace.target = "_blank";
        enlace.textContent = " Leer más";

        footer.appendChild(tiempo);
        footer.appendChild(enlace);
        noticiaDiv.appendChild(footer);
        contenedor.appendChild(noticiaDiv);
    });
}