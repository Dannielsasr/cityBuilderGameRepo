import { Ciudad } from "../modelos/Ciudad.js";
import { Mapa } from "../modelos/Mapa.js";
import { Economia } from "../modelos/Economia.js";


document.querySelector("form").addEventListener("submit", function(e){
    e.preventDefault();
    const nombreCiudad = document.getElementById("nombreCiudad").value;
    const alcalde = document.getElementById("nombreAlcalde").value;
    //el valor de la region es un entero (modificable)
    const region = document.getElementById("selectRegion").value;
    const tamanoMapa = document.getElementById("selectTamano").value;

    console.log(nombreCiudad, alcalde, region, tamanoMapa);
    const mapa = new Mapa( tamanoMapa, tamanoMapa);

    const economia = new Economia({ dinero: 50000, electricidad: 0, agua: 0, alimentos: 0 });

    const ciudad = new Ciudad({ nombre: nombreCiudad, region, mapa, economia });

    console.log(ciudad.mapa.ancho);
    console.log(ciudad.mapa.largo);
    console.log(ciudad.mapa.celdas)
    
    //debo guardar en local storage

    window.location.href = "../vistas/index.html";

    }); 