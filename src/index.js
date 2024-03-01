//cargo la clase en memoria 
const express = require("express");
const mysql = require("mysql");
const cookie = require('cookie-parser')



//ejecuto el constructor
const app = express();
const port = 5000;

app.use(express.json());
app.use(cookie())

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "admin",
    database: "test2"
});

app.get("/productos", (req, res)=>{
    connection.query('SELECT * FROM producto', (error, results, fields)=>{
        if(error) res.status(500).json(error);
        res.json(results)
    }) 
})

app.get("/productos", (req, res)=>{
    connection.query('SELECT * FROM producto WHERE id=' + req.query.id, (error, results, fields)=>{
        if(error) res.status(500).json(error);
        res.json(results)
    }) 
})

app.delete("/productos", (req, res)=>{
    connection.query('DELETE FROM producto WHERE id=' + req.query.id ,(error, results,fileds)=>{
        if(error) res.status(500).json(error);
        res.json({results})
    });
});

app.put('/productos', (req,res)=>{
    connection.query('INSERT INTO producto (`nombre`, `stock`, `precio`) VALUES ("' + req.query.nombre + '", ' + req.query.stock + ', ' + req.query.precio + ')', (error, results, fields)=>{//funcion handler
        if(error) res.status(500).json(error);
        res.json({results});
    });
});

app.post('/productos', (req,res)=>{
    connection.query('UPDATE producto SET nombre="'+ req.query.nombre +'", stock='+ req.query.stock +', precio=' + req.query.precio + ' WHERE id=' + req.query.id, (error, results, fields)=>{
        if(error) res.status(500).json(error);
        res.json({results});
    });
});
//Es una comparación dentro del Db buscando un usuario y un pass que tengan esas caracteristicas y si existe se autenticó con exito todo mediante un formulario
app.post("/auth", (req, res)=>{
    connection.query('SELECT * FROM usuario WHERE nombre="' + req.query.nombre +'" AND contrasena="' + req.query.contrasena + '"', (error, results, fields)=>{
        if (error) throw error;
        if(results.length != 0) {
            res.cookie('usuario', req.query.nombre).json({message:"ok"})
        } else{
            res.json({message:"Fallo"})
        }
    })
})

app.post("/changepass", (req, res) => {
    if (!req.cookies.usuario) {
        res.json({ message: "FALLO" });
        return;
    }
    connection.query('SELECT * FROM usuario WHERE nombre="' + req.cookies.usuario + '" AND contrasena="' + req.query.contrasenaactual + '"', (error, results, fields) => {
        if (error) {//nivel DB
            res.json(error);
            return;
        }
        if (results.length == 0) {//nivel respuesta vacia
            res.json({ message: "FALLO" });
            return;
        }
        if (req.query.contrasenanueva != req.query.confirmacontrasena) {//dentro de la solicitud del cliente tiene q confirmarse que campo contraseña nueva y confirmar contraseña nueva sean iguales
            res.json({ message: "FALLO" });
            return;
        }
        connection.query('UPDATE usuario SET contrasena="' + req.query.contrasenanueva + '" WHERE nombre="' + req.cookies.usuario + '"', (error, results, fields) => {//req.query.contrasenanueva parte del formulario - req.cookies.usuario dentro de la cookie registrada previamente
            if (error) {
                res.json(error);
                return;
            }
            res.json({ message: "ok" })
        });
    });
});

app.listen(port, ()=>{})
