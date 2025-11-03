// server.js (El puente entre tu Frontend y MySQL)

const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors');

const app = express();
const PORT = 3000;

// Configuración de Conexión a MySQL (XAMPP)
const dbConfig = {
    host: 'localhost',
    user: 'root',      
    password: '',      
    database: 'todolist_db'
};

// Middleware
app.use(cors());       
app.use(express.json());

// Función para establecer la conexión a la DB
const getConnection = async () => {
    return await mysql.createConnection(dbConfig);
};

// UTILITY: Formatea el resultado de la DB a la estructura del Frontend
const formatTasksByGroup = (rows) => {
    const groupsMap = {};

    rows.forEach(row => {
        if (!groupsMap[row.grupo_id]) {
            groupsMap[row.grupo_id] = {
                grupo_id: row.grupo_id,
                nombre: row.nombre_grupo,
                tareas: []
            };
        }

        if (row.tarea_id !== null) {
            groupsMap[row.grupo_id].tareas.push({
                tarea_id: row.tarea_id,
                texto: row.texto_tarea,
                completada: row.completada,
                fecha_creacion: row.fecha_creacion,
                fecha_finalizacion: row.fecha_finalizacion,
                nota_finalizacion: row.nota_finalizacion // <-- Añadido para el frontend
            });
        }
    });

    return Object.values(groupsMap);
};


// ------------------------------------------------------------------
// RUTAS API (Endpoints)
// ------------------------------------------------------------------

// GET /api/grupos: Obtiene todos los grupos y sus tareas
app.get('/api/grupos', async (req, res) => {
    const query = `
        SELECT 
            G.grupo_id, G.nombre AS nombre_grupo, 
            T.tarea_id, T.texto AS texto_tarea, T.completada, 
            T.fecha_creacion, T.fecha_finalizacion, T.nota_finalizacion
        FROM Grupos G
        LEFT JOIN Tareas T ON G.grupo_id = T.grupo_id
        ORDER BY G.grupo_id, T.fecha_creacion;
    `;
    
    try {
        const connection = await getConnection();
        const [rows] = await connection.execute(query);
        connection.end();
        
        const data = formatTasksByGroup(rows);
        res.json(data);

    } catch (error) {
        console.error('Error al obtener grupos:', error);
        res.status(500).json({ error: 'Error interno del servidor al obtener grupos.' });
    }
});

// POST /api/grupos: Crea un nuevo grupo
app.post('/api/grupos', async (req, res) => {
    const { nombre } = req.body;
    const query = 'INSERT INTO Grupos (nombre) VALUES (?)';

    try {
        const connection = await getConnection();
        const [result] = await connection.execute(query, [nombre]);
        connection.end();
        res.status(201).json({ grupo_id: result.insertId, nombre }); 

    } catch (error) {
        if (error.errno === 1062) {
             return res.status(409).json({ error: 'El grupo ya existe.' });
        }
        res.status(500).json({ error: 'Error al crear grupo.' });
    }
});

// DELETE /api/grupos/:id: Elimina un grupo
app.delete('/api/grupos/:id', async (req, res) => {
    const grupoId = req.params.id;
    const query = 'DELETE FROM Grupos WHERE grupo_id = ?';

    try {
        const connection = await getConnection();
        await connection.execute(query, [grupoId]);
        connection.end();
        res.status(204).send(); 

    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar grupo.' });
    }
});

// POST /api/tareas: Crea una nueva tarea
app.post('/api/tareas', async (req, res) => {
    const { grupo_id, texto } = req.body;
    const query = 'INSERT INTO Tareas (grupo_id, texto) VALUES (?, ?)';

    try {
        const connection = await getConnection();
        const [result] = await connection.execute(query, [grupo_id, texto]);
        connection.end();
        res.status(201).json({ tarea_id: result.insertId, texto });

    } catch (error) {
        res.status(500).json({ error: 'Error al crear tarea.' });
    }
});

// PATCH /api/tareas/:id: Actualiza el estado y la nota de una tarea
app.patch('/api/tareas/:id', async (req, res) => {
    const tareaId = req.params.id;
    // <--- ¡Recibiendo la nueva nota!
    const { completada, fecha_finalizacion, nota_finalizacion } = req.body; 
    
    const completadaSQL = completada ? 1 : 0;
    
    const query = `
        UPDATE Tareas 
        SET completada = ?, fecha_finalizacion = ?, nota_finalizacion = ?
        WHERE tarea_id = ?
    `;
    
    try {
        const connection = await getConnection();
        // <--- Pasando la nota al SQL
        await connection.execute(query, [completadaSQL, fecha_finalizacion, nota_finalizacion, tareaId]); 
        connection.end();
        res.status(200).json({ message: 'Tarea actualizada.' });

    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        res.status(500).json({ error: 'Error al actualizar tarea.' });
    }
});

// DELETE /api/tareas/:id: Elimina una tarea
app.delete('/api/tareas/:id', async (req, res) => {
    const tareaId = req.params.id;
    const query = 'DELETE FROM Tareas WHERE tarea_id = ?';

    try {
        const connection = await getConnection();
        await connection.execute(query, [tareaId]);
        connection.end();
        res.status(204).send();

    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar tarea.' });
    }
});


// INICIO DEL SERVIDOR
app.listen(PORT, () => {
    console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`);
});