const app = document.getElementById('app');

const API_URL = 'http://localhost:3000/api'; 

let todosLosGrupos = []; 
let listaTareas, inputTarea, botonAgregar, inputGrupo, botonCrearGrupo, selectorGrupo;

async function inicializarApp() {
    // Nota: El H1 y la lista UL se crean aquí si no están en el HTML. 
    // Como tu HTML ya tiene listaTareas, solo se agrega el H1.
    const h1 = document.createElement('h1');
    h1.textContent = 'Lista de Tareas con Grupos (SQL)';
    app.prepend(h1); 
    
    // Ya no es necesario crear listaTareasUL si está en el HTML, pero lo dejamos como seguro
    const listaTareasUL = document.createElement('ul');
    listaTareasUL.id = 'listaTareas';
    if (!document.getElementById('listaTareas')) {
        app.appendChild(listaTareasUL);
    }

    configurarEventos(); 
    await cargarGrupos(); 
}

function configurarEventos() {
    listaTareas = document.getElementById('listaTareas'); 
    inputTarea = document.getElementById('inputTarea'); 
    botonAgregar = document.getElementById('botonAgregar');
    inputGrupo = document.getElementById('inputGrupo'); 
    botonCrearGrupo = document.getElementById('botonCrearGrupo');
    selectorGrupo = document.getElementById('selectorGrupo'); 

    botonAgregar.addEventListener('click', agregarNuevaTarea);
    inputTarea.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            agregarNuevaTarea();
        }
    });

    botonCrearGrupo.addEventListener('click', crearNuevoGrupo);
    inputGrupo.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            crearNuevoGrupo();
        }
    });
}
async function cargarGrupos() {
    try {
        const respuesta = await fetch(`${API_URL}/grupos`);
        if (!respuesta.ok) throw new Error('Error al cargar datos del servidor.');
        
        todosLosGrupos = await respuesta.json(); 
        renderizarGrupos();
        actualizarSelectorGrupos();
    } catch (error) {
        console.error("Error cargando grupos:", error);
    }
}

async function crearNuevoGrupo() {
    const nombre = inputGrupo.value.trim();
    
    if (nombre) {
        try {
            const respuesta = await fetch(`${API_URL}/grupos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre })
            });
            if (!respuesta.ok) throw new Error('Fallo al crear el grupo.');

            inputGrupo.value = '';
            await cargarGrupos(); 
        } catch (error) {
            alert(`Error al crear el grupo: ${error.message}`);
        }
    }
}

async function eliminarGrupo(grupoId) {
    if (confirm(`¿Estás seguro de que quieres borrar el grupo y todas sus tareas?`)) {
        try {
            const respuesta = await fetch(`${API_URL}/grupos/${grupoId}`, {
                method: 'DELETE'
            });
            if (!respuesta.ok) throw new Error('Fallo al eliminar el grupo.');

            await cargarGrupos(); 
        } catch (error) {
            console.error("Error al eliminar grupo:", error);
        }
    }
}

async function agregarNuevaTarea() {
    const texto = inputTarea.value.trim();
    const grupoIdSeleccionado = selectorGrupo.value; 
    
    if (texto !== "" && grupoIdSeleccionado) {
        try {
            const nuevaTareaData = {
                grupo_id: parseInt(grupoIdSeleccionado), 
                texto: texto
            };

            const respuesta = await fetch(`${API_URL}/tareas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaTareaData)
            });
            if (!respuesta.ok) throw new Error('Fallo al agregar la tarea.');

            inputTarea.value = '';
            await cargarGrupos(); 
        } catch (error) {
            console.error("Error al agregar tarea:", error);
        }
    }
}

async function actualizarEstadoTarea(tareaId, completada) {
    try {
        const estado = {
            completada: completada,
            fecha_finalizacion: completada ? new Date().toISOString() : null
        };
        
        const respuesta = await fetch(`${API_URL}/tareas/${tareaId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(estado)
        });

        if (!respuesta.ok) throw new Error('Fallo al actualizar el estado.');
        
        return true; 
    } catch (error) {
        console.error("Error al actualizar tarea:", error);
        return false;
    }
}

async function eliminarTareaIndividual(tareaId) {
    try {
        const respuesta = await fetch(`${API_URL}/tareas/${tareaId}`, {
            method: 'DELETE'
        });
        if (!respuesta.ok) throw new Error('Fallo al eliminar la tarea.');

        await cargarGrupos(); 
    } catch (error) {
        console.error("Error al eliminar tarea:", error);
    }
}


function actualizarSelectorGrupos() {
    selectorGrupo.innerHTML = '';
    
    todosLosGrupos.forEach(grupo => {
        const option = document.createElement('option');
        option.value = grupo.grupo_id;
        option.textContent = grupo.nombre;
        selectorGrupo.appendChild(option);
    });
}

function renderizarGrupos() {
    listaTareas.innerHTML = '';

    todosLosGrupos.forEach(grupo => {
        const grupoId = grupo.grupo_id; 
        const nombreGrupo = grupo.nombre;

        const grupoHeaderDiv = document.createElement('div');
        grupoHeaderDiv.className = 'nombre-grupo-contenedor'; 

        const h2 = document.createElement('h2');
        h2.textContent = nombreGrupo;
        grupoHeaderDiv.appendChild(h2);

        const botonEliminarGrupo = document.createElement('button');
        botonEliminarGrupo.className = 'boton-eliminar-grupo';
        botonEliminarGrupo.textContent = '❌ Borrar Grupo';
        
        botonEliminarGrupo.addEventListener('click', () => {
            eliminarGrupo(grupoId); 
        });
        grupoHeaderDiv.appendChild(botonEliminarGrupo);
        
        listaTareas.appendChild(grupoHeaderDiv);

        const ulGrupo = document.createElement('ul');
        ulGrupo.id = `ul-grupo-${grupoId}`; 
        
        grupo.tareas.forEach(tareaData => { 
            crearElementoTarea(tareaData, ulGrupo); 
        });

        listaTareas.appendChild(ulGrupo);
    });
}

function crearElementoTarea(tareaData, contenedorLista) {
    const li = document.createElement('li');
    li.tareaData = tareaData;

    if (tareaData.completada) {
        li.classList.add('tarea-completa');
    }

    const contenidoDiv = document.createElement('div');
    contenidoDiv.style.flexGrow = '1';

    const textoSpan = document.createElement('span');
    textoSpan.textContent = tareaData.texto;
    textoSpan.className = 'texto-tarea'; // 👈 CORRECCIÓN: Clase para que funcione el CSS de tachado
    contenidoDiv.appendChild(textoSpan);
    
    const metadatosDiv = document.createElement('div');
    metadatosDiv.className = 'metadatos'; // 👈 OPCIONAL: Agregando clase para metadatos
    
    const creacionSpan = document.createElement('span');
    creacionSpan.textContent = `Creada: ${formatearFecha(tareaData.fecha_creacion)}`;
    metadatosDiv.appendChild(creacionSpan);
    
    const finalizacionSpan = document.createElement('span');
    finalizacionSpan.id = `finalizacion-${tareaData.tarea_id}`; 
    finalizacionSpan.style.marginLeft = '10px';
    finalizacionSpan.textContent = `Finalizada: ${formatearFecha(tareaData.fecha_finalizacion)}`;
    metadatosDiv.appendChild(finalizacionSpan);

    contenidoDiv.appendChild(metadatosDiv);
    li.appendChild(contenidoDiv);

    li.addEventListener('click', async () => {
        const estaCompleta = !li.classList.contains('tarea-completa'); 
        const exito = await actualizarEstadoTarea(tareaData.tarea_id, estaCompleta);
        
        if (exito) {
            li.classList.toggle('tarea-completa');
            const fechaString = estaCompleta ? new Date().toISOString() : null;
            finalizacionSpan.textContent = `Finalizada: ${formatearFecha(fechaString)}`;
        }
    });

    const botonEliminar = document.createElement('button');
    botonEliminar.className = 'boton-eliminar';
    botonEliminar.textContent = '🗑️';
    
    botonEliminar.addEventListener('click', (e) => {
        e.stopPropagation();
        eliminarTareaIndividual(tareaData.tarea_id);
    });

    li.appendChild(botonEliminar);
    contenedorLista.appendChild(li);

    return li;
}

function formatearFecha(fechaString) {
    if (!fechaString) return 'Pendiente';
    
    const fecha = new Date(fechaString);
    const opciones = { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return fecha.toLocaleString('es-ES', opciones); 
}

// Inicia la aplicación al cargar el script
inicializarApp();