// =================================================================
// ARCHIVO: script.js (Versión Demo con localStorage)
// Objetivo: Funcionalidad completa para GitHub Pages sin Node.js/MySQL.
// =================================================================

// 1. SELECTORES DE ELEMENTOS
// -----------------------------------------------------------------
const listaTareas = document.getElementById('listaTareas');
const selectorGrupo = document.getElementById('selectorGrupo');
const inputGrupo = document.getElementById('inputGrupo');
const botonCrearGrupo = document.getElementById('botonCrearGrupo');
const inputTarea = document.getElementById('inputTarea');
const botonAgregar = document.getElementById('botonAgregar');


// 2. LÓGICA DE LOCALSTORAGE (Simulación de la Base de Datos)
// -----------------------------------------------------------------

function cargarDatosDemo() {
    // Usamos 'todo_list_demo' como clave para no interferir con otras cosas.
    const datos = localStorage.getItem('todo_list_demo');
    return datos ? JSON.parse(datos) : [];
}

function guardarDatosDemo(grupos) {
    localStorage.setItem('todo_list_demo', JSON.stringify(grupos));
}


// 3. FUNCIONES CRUD SIMULADAS
// -----------------------------------------------------------------

// *********** GRUPOS ***********

async function obtenerGrupos() {
    return cargarDatosDemo();
}

async function crearGrupo(nombre) {
    let grupos = cargarDatosDemo();
    
    // Simula el ID único que daría la BD
    const nuevoGrupo = {
        grupo_id: Date.now(), 
        nombre: nombre,
        tareas: [] 
    };

    grupos.push(nuevoGrupo);
    guardarDatosDemo(grupos);
    
    return nuevoGrupo;
}

async function eliminarGrupo(grupo_id) {
    let grupos = cargarDatosDemo();
    const gruposActualizados = grupos.filter(g => g.grupo_id !== grupo_id);
    
    guardarDatosDemo(gruposActualizados);
    return true; 
}


// *********** TAREAS ***********

async function crearTarea(grupo_id, texto) {
    let grupos = cargarDatosDemo();
    // Importante: Convertir a número, ya que selector.value es string
    const grupo = grupos.find(g => g.grupo_id === parseInt(grupo_id)); 

    if (!grupo) return null;

    const nuevaTarea = {
        tarea_id: Date.now() + Math.random(), 
        grupo_id: grupo_id,
        texto: texto,
        completada: false,
        fecha_creacion: new Date().toISOString(),
        fecha_finalizacion: null
    };

    grupo.tareas.push(nuevaTarea);
    guardarDatosDemo(grupos);

    return nuevaTarea;
}

async function marcarTareaComoCompletada(tarea_id, completada) {
    let grupos = cargarDatosDemo();
    let tareaEncontrada = null;

    for (const grupo of grupos) {
        // Asegúrate de comparar el ID como número si lo guardas como número
        tareaEncontrada = grupo.tareas.find(t => t.tarea_id === parseFloat(tarea_id)); 
        if (tareaEncontrada) {
            tareaEncontrada.completada = completada;
            tareaEncontrada.fecha_finalizacion = completada ? new Date().toISOString() : null;
            break;
        }
    }
    
    if (tareaEncontrada) {
        guardarDatosDemo(grupos);
        return tareaEncontrada;
    }
    return null;
}

async function eliminarTarea(tarea_id) {
    let grupos = cargarDatosDemo();
    let tareaEliminada = false;

    for (const grupo of grupos) {
        const tareasAntes = grupo.tareas.length;
        // Filtra para eliminar la tarea (comparando como número)
        grupo.tareas = grupo.tareas.filter(t => t.tarea_id !== parseFloat(tarea_id));
        
        if (grupo.tareas.length < tareasAntes) {
            tareaEliminada = true;
            break;
        }
    }

    if (tareaEliminada) {
        guardarDatosDemo(grupos);
        return true;
    }
    return false;
}


// 4. LÓGICA DE RENDERIZADO DEL DOM
// -----------------------------------------------------------------

function formatearFecha(fechaString) {
    if (!fechaString) return '';
    const opciones = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(fechaString).toLocaleDateString('es-ES', opciones);
}

function crearElementoTarea(tarea) {
    const li = document.createElement('li');
    li.className = tarea.completada ? 'tarea-completa' : '';
    li.dataset.tareaId = tarea.tarea_id;
    
    // Contenedor de texto y metadatos
    const textoDiv = document.createElement('div');
    textoDiv.classList.add('texto-tarea-contenedor');
    
    const textoTarea = document.createElement('span');
    textoTarea.classList.add('texto-tarea');
    textoTarea.textContent = tarea.texto;

    const metadatos = document.createElement('div');
    metadatos.classList.add('metadatos');
    let fechaTexto = `Creada: ${formatearFecha(tarea.fecha_creacion)}`;
    if (tarea.completada) {
        fechaTexto += ` | Finalizada: ${formatearFecha(tarea.fecha_finalizacion)}`;
    }
    metadatos.textContent = fechaTexto;

    textoDiv.appendChild(textoTarea);
    textoDiv.appendChild(metadatos);

    // Botón de eliminar
    const botonEliminar = document.createElement('button');
    botonEliminar.classList.add('boton-eliminar');
    botonEliminar.innerHTML = '&#10005;'; 

    li.appendChild(textoDiv);
    li.appendChild(botonEliminar);
    
    // Evento para marcar/desmarcar
    li.addEventListener('click', async (e) => {
        if (e.target === botonEliminar) return; 
        
        const nuevaCompleta = !li.classList.contains('tarea-completa');
        const tareaActualizada = await marcarTareaComoCompletada(tarea.tarea_id, nuevaCompleta);
        if (tareaActualizada) {
            cargarTareas(); 
        }
    });
    
    // Evento para eliminar
    botonEliminar.addEventListener('click', async () => {
        if (await eliminarTarea(tarea.tarea_id)) {
            cargarTareas(); 
        }
    });

    return li;
}

function crearBloqueGrupo(grupo) {
    const contenedor = document.createElement('div');
    contenedor.classList.add('grupo-bloque');
    
    const nombreContenedor = document.createElement('div');
    nombreContenedor.classList.add('nombre-grupo-contenedor');

    const h2 = document.createElement('h2');
    h2.textContent = grupo.nombre;

    const botonEliminarGrupo = document.createElement('button');
    botonEliminarGrupo.classList.add('boton-eliminar-grupo');
    botonEliminarGrupo.textContent = 'Eliminar Grupo';
    botonEliminarGrupo.addEventListener('click', async () => {
        if (confirm(`¿Estás seguro de que quieres eliminar el grupo "${grupo.nombre}" y todas sus tareas?`)) {
            if (await eliminarGrupo(grupo.grupo_id)) {
                cargarTareas(); 
            }
        }
    });

    nombreContenedor.appendChild(h2);
    nombreContenedor.appendChild(botonEliminarGrupo);
    contenedor.appendChild(nombreContenedor);

    // Añade todas las tareas del grupo
    grupo.tareas.forEach(tarea => {
        contenedor.appendChild(crearElementoTarea(tarea));
    });

    return contenedor;
}

function rellenarSelectorGrupos(grupos) {
    selectorGrupo.innerHTML = ''; 

    if (grupos.length === 0) {
        const option = document.createElement('option');
        option.textContent = 'Crea un grupo primero';
        option.value = '';
        option.disabled = true;
        selectorGrupo.appendChild(option);
        return;
    }
    
    grupos.forEach(grupo => {
        const option = document.createElement('option');
        option.value = grupo.grupo_id; // El valor del option es el ID del grupo
        option.textContent = grupo.nombre;
        selectorGrupo.appendChild(option);
    });
}

async function cargarTareas() {
    const grupos = await obtenerGrupos();
    
    // 1. Renderiza los grupos y tareas
    listaTareas.innerHTML = ''; 
    grupos.forEach(grupo => {
        listaTareas.appendChild(crearBloqueGrupo(grupo));
    });

    // 2. Actualiza el selector
    rellenarSelectorGrupos(grupos);
}


// 5. EVENTOS
// -----------------------------------------------------------------

// Evento: Crear nuevo grupo
botonCrearGrupo.addEventListener('click', async () => {
    const nombre = inputGrupo.value.trim();
    if (nombre) {
        await crearGrupo(nombre);
        inputGrupo.value = ''; 
        cargarTareas();       
    } else {
        alert('Debes ingresar un nombre para el grupo.');
    }
});

// Evento: Agregar nueva tarea
botonAgregar.addEventListener('click', async () => {
    const texto = inputTarea.value.trim();
    // Convertir el valor a número, ya que el ID está guardado como Date.now()
    const grupo_id_seleccionado = parseInt(selectorGrupo.value);
    
    if (texto && grupo_id_seleccionado) {
        await crearTarea(grupo_id_seleccionado, texto);
        inputTarea.value = ''; 
        cargarTareas();       
    } else if (!grupo_id_seleccionado) {
        alert('Debes seleccionar o crear un grupo antes de añadir una tarea.');
    } else {
        alert('Debes ingresar texto para la tarea.');
    }
});


// 6. INICIALIZACIÓN
// -----------------------------------------------------------------
document.addEventListener('DOMContentLoaded', cargarTareas);
