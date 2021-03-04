// Configuracion general
const express = require("express");
const app = express();
const port = process.env.PORT ? process.env.PORT :  3000;
app.use(express.json());
const util  = require("util");

// Conexion con base de datos

const mysql = require("mysql");
const conexion = mysql.createConnection({
    host:'localhost',
    user: 'root',
    password:'',
    database: 'biblioteca',


});
conexion.connect((error)=>{
    if(error){
        throw error;
    }
    console.log ("Conexion con base de datos establecida");

}  );

const qy = util.promisify(conexion.query).bind(conexion);




// Programa principal

// Según la categoría de los libros

app.get('/categoria', async(req,res)=>{

    try{
        const query = 'SELECT * FROM categoria';

        const respuesta = await qy(query);

        res.send({"respuesta": respuesta});
    }

    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});

    }
});

app.get('/categoria/:id', async(req,res)=>{

    try{
        const query = 'SELECT * FROM categoria WHERE id = ?';

        const respuesta = await qy(query, [req.params.id] );

        if(respuesta.length == 0 ){
            throw new Error('Categoría no EXISTENTE');

        } 

        res.send({"respuesta": respuesta});
    }

    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});

    }
});

app.post('/categoria', async (req, res) => {

    try{ //Valido que me envien correctamente la info
        if(!req.body.nombre){
            throw new Error('Debe incluir el nombre de la categoría');
        }

        const nombre = req.body.nombre;

        //Verifico que no exista la categoria ingresada

        let query = 'SELECT id FROM categoria WHERE nombre = ?';

        let respuesta =  await qy (query, [req.body.nombre]);
        if(respuesta.length > 0){
            throw new Error('Categoria EXISTENTE');
        }

        //Guardo la nueva categoria

        query = 'INSERT INTO categoria (nombre) VALUE (?)';
        respuesta = await qy(query, [nombre]);

        console.log(respuesta);
        res.send({"respuesta": respuesta});

    }
    
    catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }
})

app.delete ('/categoria/:id', async(req,res)=> {

    try{
        // CONSULTA si existe una relacion con un libro cargado, NO ELIMINA

        /*let query = 'SELECT * FROM categoria WHERE categoria_id = ? ';
        let respuesta = await qy( query, [req.params.id]);
       
        if(respuesta.length > 0){
            throw new Error('Categoria asociada a un libro, no se puede ELIMINAR');
            
        }
        */

        // CONSULTO SI LA CATEGORIA A ELIMINAR EXISTE
        let query = 'SELECT * FROM categoria WHERE id = ?';

        let respuesta = await qy(query, [req.params.id] );

        if(respuesta.length == 0 ){
            throw new Error('Categoría no EXISTENTE');

        } 

        // ELIMINA LA CATEGORIA

        query = 'DELETE FROM categoria WHERE id = ? ';
        respuesta = await qy (query, [req.params.id] );
        res.send ({
            'respuesta': respuesta,
        });
     }
     catch(e){
        console.error(e.message);

        res.status(413).send({"Error": e.message});
    }

});

 


// Conexion con el servidor
app.listen(port, () =>{
    console.log("Servidor en el puerto: "  ,port)
});