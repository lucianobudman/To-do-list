
const express = require('express');
const mysql = require('mysql2/promise'); 
const cors = require('cors');

const app = express();
const PORT = 3000;

const dbConfig = {
    host: 'localhost',
    user: 'root',   
    password: '',     
    database: 'todolist_db' 
};


app.use(cors());       // peticiones desde el frontend (http://localhost)
app.use(express.json()); // leer el JSON

const getConnection = async () => {
    return await mysql.createConnection(dbConfig);
};


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
                fecha_finalizacion: row.fecha_finalizacion
            });
        }
    });
    return Object.values(groupsMap);
};


app.get('/api/grupos', async (req, res) => {
    const query = `
        SELECT 
            G.grupo_id, G.nombre AS nombre_grupo, 
            T.tarea_id, T.texto AS texto_tarea, T.completada, 
            T.fecha_creacion, T.fecha_finalizacion
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

app.post('/api/grupos', async (req, res) => {
    const { nombre } = req.body;
    const query = 'INSERT INTO Grupos (nombre) VALUES (?)';

    try {
        const connection = await getConnection();
        const [result] = await connection.execute(query, [nombre]);
        connection.end();
        res.status(201).json({ grupo_id: result.insertId, nombre }); 

    } catch (error) {
        console.error('Error al crear grupo:', error);
        if (error.errno === 1062) {
             return res.status(409).json({ error: 'El grupo ya existe.' });
        }
        res.status(500).json({ error: 'Error al crear grupo.' });
    }
});

app.delete('/api/grupos/:id', async (req, res) => {
    const grupoId = req.params.id;
    const query = 'DELETE FROM Grupos WHERE grupo_id = ?';

    try {
        const connection = await getConnection();
        await connection.execute(query, [grupoId]);
        connection.end();
        res.status(204).send();

    } catch (error) {
        console.error('Error al eliminar grupo:', error);
        res.status(500).json({ error: 'Error al eliminar grupo.' });
    }
});

app.post('/api/tareas', async (req, res) => {
    const { grupo_id, texto } = req.body;
    const query = 'INSERT INTO Tareas (grupo_id, texto) VALUES (?, ?)';

    try {
        const connection = await getConnection();
        const [result] = await connection.execute(query, [grupo_id, texto]);
        connection.end();
        res.status(201).json({ tarea_id: result.insertId, texto });

    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({ error: 'Error al crear tarea.' });
    }
});

app.patch('/api/tareas/:id', async (req, res) => {
    const tareaId = req.params.id;
    const { completada, fecha_finalizacion } = req.body;
    
    const completadaSQL = completada ? 1 : 0;
    
    const query = `
        UPDATE Tareas 
        SET completada = ?, fecha_finalizacion = ?
        WHERE tarea_id = ?
    `;
    
    try {
        const connection = await getConnection();
        await connection.execute(query, [completadaSQL, fecha_finalizacion, tareaId]);
        connection.end();
        res.status(200).json({ message: 'Tarea actualizada.' });

    } catch (error) {
        console.error('Error al actualizar tarea:', error);
        res.status(500).json({ error: 'Error al actualizar tarea.' });
    }
});

app.delete('/api/tareas/:id', async (req, res) => {
    const tareaId = req.params.id;
    const query = 'DELETE FROM Tareas WHERE tarea_id = ?';

    try {
        const connection = await getConnection();
        await connection.execute(query, [tareaId]);
        connection.end();
        res.status(204).send();

    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        res.status(500).json({ error: 'Error al eliminar tarea.' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor Node.js corriendo en http://localhost:${PORT}`);
});