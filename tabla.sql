-- setup.sql

-- 1. Crear la tabla Grupos
CREATE TABLE Grupos (
    grupo_id INT NOT NULL AUTO_INCREMENT, -- Clave primaria (Primary Key)
    nombre VARCHAR(255) NOT NULL UNIQUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (grupo_id)
);

-- 2. Crear la tabla Tareas, incluyendo la Clave Foránea
CREATE TABLE Tareas (
    tarea_id INT NOT NULL AUTO_INCREMENT,
    grupo_id INT NOT NULL,  -- Clave Foránea (Foreign Key)
    texto VARCHAR(255) NOT NULL,
    completada BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_finalizacion DATETIME NULL,
    PRIMARY KEY (tarea_id),
    
    -- Definir la relación de clave foránea
    FOREIGN KEY (grupo_id) 
        REFERENCES Grupos(grupo_id)
        ON DELETE CASCADE -- Si el grupo se borra, sus tareas también
);