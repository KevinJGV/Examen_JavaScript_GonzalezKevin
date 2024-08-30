function cargarRecetas(terminoBusqueda = "", valorFiltro = "") {
    const recetas = JSON.parse(localStorage.getItem("recetas")) || [];
    const elementoArticulo = document.querySelector("article");
    elementoArticulo.innerHTML = ""; // Limpiar el contenido existente

    recetas.forEach((receta, indice) => {
        if (coincideConBusquedaYFiltro(receta, terminoBusqueda, valorFiltro)) {
            const elementoReceta = crearElementoReceta(receta, indice);
            elementoArticulo.appendChild(elementoReceta);
        }
    });
}

function coincideConBusquedaYFiltro(receta, terminoBusqueda, valorFiltro) {
    const coincideBusqueda = receta.nombre
        .toLowerCase()
        .includes(terminoBusqueda.toLowerCase());
    const coincideFiltro =
        valorFiltro === "" ||
        receta.categoria === valorFiltro ||
        receta.dificultad === valorFiltro.replace("Dificultad - ", "");
    return coincideBusqueda && coincideFiltro;
}

function crearElementoReceta(receta, indice) {
    const div = document.createElement("div");
    div.className = "flex_col relative card all_c";
    div.innerHTML = `
        <h3>${receta.nombre}</h3>
        <strong>Ingredientes: </strong> <span data-type="textarea">${receta.ingredientes}</span>
        <strong>Instrucciones: </strong> <span data-type="textarea">${receta.instrucciones}</span>
        <strong>Tiempo estimado: </strong> <span data-type="time">${receta.tiempo}</span>
        <strong>Porciones: </strong> <span data-type="number">${receta.porciones}</span>
        <strong>Categoría: </strong> <span data-type="select-categoria">${receta.categoria}</span>
        <strong>Dificultad: </strong> <span data-type="select-dificultad">${receta.dificultad}</span>
        <button>Eliminar</button>
    `;

    agregarEventosEdicion(div, receta, indice);
    agregarEventoEliminacion(div, indice);
    return div;
}

function agregarEventosEdicion(elemento, receta, indice) {
    const elementosEditables = elemento.querySelectorAll("h3, span");
    elementosEditables.forEach((el) => {
        const manejadorClic = function () {
            const elementoEntrada = crearElementoEntrada(this);
            const contenidoOriginal = this.textContent;
            this.textContent = "";
            this.appendChild(elementoEntrada);
            elementoEntrada.focus();

            elementoEntrada.addEventListener("blur", function () {
                debugger;
                const nuevoValor = this.value || this.textContent;
                if (nuevoValor === "") {
                    el.textContent = contenidoOriginal;
                } else if (nuevoValor !== contenidoOriginal) {
                    actualizarReceta(receta, indice, el, nuevoValor);
                    el.textContent = nuevoValor;
                }

                setTimeout(() => el.addEventListener("click", manejadorClic), 0);
            });

            el.removeEventListener("click", manejadorClic);
        };

        el.addEventListener("click", manejadorClic);
    });
}

function crearElementoEntrada(elemento) {
    const tipo = elemento.dataset.type || "text";
    let elementoEntrada;

    switch (tipo) {
        case "textarea":
            elementoEntrada = document.createElement("textarea");
            elementoEntrada.cols = 25;
            elementoEntrada.rows = 5;
            break;
        case "time":
            elementoEntrada = document.createElement("input");
            elementoEntrada.type = "time";
            break;
        case "number":
            elementoEntrada = document.createElement("input");
            elementoEntrada.type = "number";
            break;
        case "select-categoria":
            elementoEntrada = document.createElement("select");
            ["Desayuno", "Almuerzo", "Merienda", "Cena", "Postre"].forEach(
                (opcion) => {
                    const elementoOpcion = document.createElement("option");
                    elementoOpcion.value = opcion;
                    elementoOpcion.textContent = opcion;
                    elementoEntrada.appendChild(elementoOpcion);
                }
            );
            break;
        case "select-dificultad":
            elementoEntrada = document.createElement("select");
            ["Fácil", "Medio", "Difícil"].forEach((opcion) => {
                const elementoOpcion = document.createElement("option");
                elementoOpcion.value = opcion;
                elementoOpcion.textContent = opcion;
                elementoEntrada.appendChild(elementoOpcion);
            });
            break;
        default:
            elementoEntrada = document.createElement("input");
            elementoEntrada.type = "text";
    }

    elementoEntrada.value = elemento.textContent;
    return elementoEntrada;
}

function agregarEventoEliminacion(elemento, indice) {
    const botonEliminar = elemento.querySelector("button");
    botonEliminar.addEventListener("click", function () {
        eliminarReceta(indice);
    });
}

function actualizarReceta(receta, indice, elemento, nuevoValor) {
    const clave =
        elemento.tagName === "H3"
            ? "nombre"
            : elemento.previousElementSibling.textContent
                  .toLowerCase()
                  .replace(":", "")
                  .trim();
    receta[clave] = nuevoValor;

    const recetas = JSON.parse(localStorage.getItem("recetas")) || [];
    recetas[indice] = receta;
    localStorage.setItem("recetas", JSON.stringify(recetas));
}

function eliminarReceta(indice) {
    const recetas = JSON.parse(localStorage.getItem("recetas")) || [];
    recetas.splice(indice, 1);
    localStorage.setItem("recetas", JSON.stringify(recetas));
    cargarRecetas();
}

document.getElementById("nuevo").addEventListener("submit", function (e) {
    e.preventDefault();
    const nuevaReceta = {
        nombre: document.getElementById("nuevo_nombre").value,
        ingredientes: document.getElementById("nuevo_ingrediente").value,
        instrucciones: document.getElementById("nuevo_instrucciones").value,
        tiempo: document.getElementById("nuevo_tiempo").value,
        porciones: document.getElementById("nuevo_porcion").value,
        categoria: document.getElementById("nuevo_categoria").value,
        dificultad: document.getElementById("nuevo_dificultad").value,
    };

    const recetas = JSON.parse(localStorage.getItem("recetas")) || [];
    recetas.push(nuevaReceta);
    localStorage.setItem("recetas", JSON.stringify(recetas));

    cargarRecetas();
    this.reset();
});

document.addEventListener("DOMContentLoaded", function () {
    const entradaBusqueda = document.getElementById("buscar");
    const selectFiltro = document.getElementById("filtrar");

    entradaBusqueda.addEventListener(
        "input",
        debounce(function () {
            cargarRecetas(this.value, selectFiltro.value);
        }, 300)
    );

    selectFiltro.addEventListener("change", function () {
        cargarRecetas(entradaBusqueda.value, this.value);
    });

    cargarRecetas();
});

function debounce(funcion, retraso) {
    let temporizadorDebounce;
    return function () {
        const contexto = this;
        const argumentos = arguments;
        clearTimeout(temporizadorDebounce);
        temporizadorDebounce = setTimeout(() => funcion.apply(contexto, argumentos), retraso);
    };
}