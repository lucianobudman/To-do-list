# 🚀 Task Manager Full-Stack (API + MySQL)

Este proyecto es una **aplicación completa** de gestión de tareas que desarrollé para demostrar mi capacidad de conectar las tres piezas clave del desarrollo moderno: **Frontend, Backend y Base de Datos (SQL)**.

El objetivo fue construir una herramienta funcional para crear y categorizar tareas que, a diferencia de un proyecto básico, **guarda la información de forma permanente** en una base de datos.

## ✨ Características Principales

* **Clasificación por Grupos:** Permite crear y eliminar grupos de tareas de forma dinámica (ej: "Personal", "Estudios", "Trabajo").
* **Gestión Completa:** Permite añadir, completar, eliminar tareas y borrar grupos completos.
* **Registro de Tiempos:** Muestra la fecha de creación y la fecha exacta de finalización de cada tarea.
* **Persistencia Real:** La información se mantiene guardada en MySQL, incluso si se reinician los servidores.

## 🛠️ Stack Tecnológico (Tres Capas)

El proyecto está dividido en dos partes que se comunican por peticiones HTTP:

| Componente | Tecnologías | Habilidades Demostradas |
| :--- | :--- | :--- |
| **Frontend (Cliente)** | **HTML, CSS** (Puro), **JavaScript** | **Manipulación del DOM**, uso de funciones **`async/await`** y **`fetch()`** para consumir servicios REST. |
| **Backend (API)** | **Node.js** con **Express** | Creación de una **API REST** completa con endpoints para todas las operaciones (CRUD) en grupos y tareas. |
| **Base de Datos** | **MySQL** (Vía XAMPP) | Diseño de la estructura de tablas (`Grupos`, `Tareas`), gestión de relaciones (Foreign Keys) y seguridad básica. |

---

## 💻 Instrucciones para Levantar el Proyecto

Para que la aplicación funcione correctamente, es necesario tener dos servidores ejecutándose y la base de datos configurada.

### **Paso 1: Configuración de la Base de Datos (MySQL)**

1.  Asegurate de tener **XAMPP** (o un servidor MySQL similar) instalado y de que el **Módulo MySQL** esté corriendo.
2.  Desde phpMyAdmin (o tu herramienta SQL preferida), Importa el codigo que hay en tabla.sql
   
### **Paso 2: Iniciar la API (Backend con Node.js)**

1.  Asegurate de tener **Node.js** instalado.
2.  Abrí una terminal y andá a la carpeta raíz del proyecto (donde está `Server.js` y `package.json`).
3.  **Instalá las dependencias:**
    ```bash
    npm install
    ```
4.  **Iniciá el servidor de la API:**
    ```bash
    npm start
    ```
    *La API se ejecutará en **`http://localhost:3000`**.*

### **Paso 3: Abrir el Frontend**

1.  Una vez que la API está corriendo, simplemente abrís el archivo **`index.html`** en tu navegador web. El código JavaScript hará el resto de la conexión automáticamente.

---

## 🔗 Ver la Demo en GitHub

https://lucianobudman.github.io/To-do-list/
