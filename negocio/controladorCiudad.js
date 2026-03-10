import { Ciudad } from "../modelos/Ciudad.js";
import { Mapa } from "../modelos/Mapa.js";
import { Economia } from "../modelos/Economia.js";

document.querySelector("#toLoadFile").addEventListener("click", function(){
    //verificar que el archivo es de tipo .txt
    //obtener y abrir documento 
    // manipular el documento para obtener los datos necesarios para crear la ciudad
    //debo crear mapa
    // debo crear ciudad
    //debo guardar en local storage
    
});

document.querySelector("form").addEventListener("submit", function(e){
    e.preventDefault();
    const nombre = document.getElementById("nombreCiudad").value;
    const alcalde = document.getElementById("nombreAlcalde").value;
    //el valor de la region es un entero (modificable)
    const region = document.getElementById("selectRegion").value;
    const tamanoMapa = document.getElementById("selectTamano").value;

    const mapa = new Mapa( tamanoMapa, tamanoMapa);

    //se inicializan valores por defecto
    const economia = new Economia({});

    const ciudad = new Ciudad({ nombre, region, mapa, economia});

    const id = ciudad.idCiudad.toString();

    const dataCiudad = {
        idCiudad: id,
        nombre: ciudad.nombre,
        region: ciudad.region,
        mapa: ciudad.mapa,
        economia: ciudad.economia,
        ciudadanos: ciudad.ciudadanos
    };

    //guarda la data de ciudad
    localStorage.setItem(id, JSON.stringify(dataCiudad));

    // guardar lista de ciudades
    let ciudades = JSON.parse(localStorage.getItem("ciudades")) || [];
    ciudades.push(id);
    localStorage.setItem("ciudades", JSON.stringify(ciudades));

    // guardar ciudad actual
    localStorage.setItem("ciudadActual", id);
    
    window.location.href = "../vistas/juego.html";

    }); 