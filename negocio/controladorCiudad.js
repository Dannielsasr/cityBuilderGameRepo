import { CiudadRepository } from "../accesoDatos/CiudadRepository.js";

const ciudadRepository = new CiudadRepository();

document.querySelector("#toLoadFile").addEventListener("click", function(){
    //verificar que el archivo es de tipo .txt
    //obtener y abrir documento 
    // manipular el documento para obtener los datos necesarios para crear la ciudad
    //debo crear mapa
    // debo crear ciudad
    //debo guardar en local storage mediante ciudadRepository
    
});

document.querySelector("form").addEventListener("submit", function(e){
    e.preventDefault();
    const nombre = document.getElementById("nombreCiudad").value;
    const alcalde = document.getElementById("nombreAlcalde").value;
    //el valor de la region es un entero (modificable)
    const region = document.getElementById("selectRegion").value;
    const tamanoMapa = document.getElementById("selectTamano").value;

    try {
        // Persistencia centralizada: toda ciudad nueva se crea via repository.
        ciudadRepository.guardarConfiguracionInicial({
            nombreCiudad: nombre,
            nombreAlcalde: alcalde,
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