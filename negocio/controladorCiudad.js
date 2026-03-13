import { CiudadRepository } from "../accesoDatos/ciudadRepository.js";

const ciudadRepository = new CiudadRepository();

document.querySelector("#toLoadFile").addEventListener("change", function(e) {
    const archivo = e.target.files[0];

    if (!archivo || !archivo.name.endsWith('.txt')) {
        alert("Por favor, selecciona un archivo de texto (.txt)");
        return;
    }

    const lector = new FileReader();

    lector.onload = function(evento) {
        const contenido = evento.target.result;
        
        try {
            
            procesarArchivoTexto(contenido);
            
            alert("Mapa cargado con éxito: " + archivo.name);
            window.location.href = "../vistas/juego.html";
            
        } catch (error) {
       
            alert("Error al procesar: " + error.message);
        }
    };

    lector.readAsText(archivo);
});

function procesarArchivoTexto(contenido) {
    
    const lineas = contenido.trim().split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    
    if (lineas.length < 5) throw new Error("Archivo muy corto");

    const nombre = lineas[0];
    const alcalde = lineas[1];
    const region = lineas[2];
    const tamano = parseInt(lineas[3]);
    
    
    const celdas = lineas.slice(4).map(fila => 
        fila.split(',').map(celda => celda.trim())
    );

    
    if (celdas.length !== tamano) {
        throw new Error(`Error de filas: El archivo dice ${tamano} pero tiene ${celdas.length}`);
    }

    const id = Date.now().toString();

    const dataCiudad = {
        idCiudad: id,
        nombre: nombre,
        alcalde: alcalde,
        region: region,
        mapa: {
            ancho: tamano,
            largo: tamano,
            celdas: celdas
        },
        economia: { dinero: 10000 },
        ciudadanos: []
    };

    localStorage.setItem(id, JSON.stringify(dataCiudad));
    localStorage.setItem("ciudadActual", id);

    let ciudades = JSON.parse(localStorage.getItem("ciudades")) || [];
    if (!ciudades.includes(id)) {
        ciudades.push(id);
        localStorage.setItem("ciudades", JSON.stringify(ciudades));
    }

    return true; 
}

document.querySelector("form").addEventListener("submit", function(e){
    e.preventDefault();
    const nombre = document.getElementById("nombreCiudad").value;
    const alcalde = document.getElementById("nombreAlcalde").value;
    
    const region = document.getElementById("selectRegion").value;
    const tamanoMapa = document.getElementById("selectTamano").value;

    try {
        
        ciudadRepository.guardarConfiguracionInicial({
            nombre: nombre,
            alcalde: alcalde,
            region,
            tamanoMapa
        });
    } catch (error) {
        const feedback = document.getElementById("formFeedback");
        if (feedback) {
            feedback.textContent = error.message;
        } else {
            alert(error.message);
        }
        return;
    }


    
    window.location.href = "../vistas/juego.html";

    }); 