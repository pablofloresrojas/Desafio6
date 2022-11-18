const express = require('express');
const path = require("path");
const {Server} = require("socket.io");
const handlebars = require('express-handlebars');

const { Router, text } = require('express');
const Contenedor = require("./contenedor");
const Chat = require('./chat');
const viewsFolder = path.join(__dirname,"views")
const app = express();

const PORT = 8080;

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static("public"))


app.engine("handlebars",handlebars.engine())

app.set("view engine", "handlebars")
app.set("views",viewsFolder)

const manejador = new Contenedor("productos.txt");
const chat = new Chat("mensajes.txt");

const routerProductos = Router();

const server = app.listen( PORT, ()=>{
    console.log(`Servidor escuchando el puerto: ${PORT}`);
});

routerProductos.get("/",async(req,res)=>{
    try {
        const resp = await manejador.getAll();
        res.status(resp.status).send(resp.data);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

routerProductos.get("/:id",async (req,res)=>{
    try {
        const resp = await manejador.getById(req.params.id);    
        res.status(resp.status).json(resp.data)
    } catch (error) {
        res.status(error.status).send(error.message);
    }
    
});

routerProductos.post("/",async (req,res)=>{
    try {
        const resp = await manejador.save(req.body);
        res.status(resp.status).json(resp.message)
    } catch (error) {
        res.status(error.status).send(error.message);
    }
})

routerProductos.delete("/:id",async (req,res)=>{
    //console.log("deleteProducto: ",req.params.id);
    try {
        const resp = await manejador.deleteById(req.params.id);
        res.status(resp.status).send(resp.message);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

routerProductos.delete("/",async (req,res)=>{
    //console.log("deleteProducto: ",req.params.id);
    try {
        const resp = await manejador.deleteAll();
        res.status(resp.status).send(resp.message);
    } catch (error) {
        res.status(error.status).send(error.message);
    }
});

app.use('/api/productos', routerProductos);

app.post("/productos", async (req, res) => {
    const resp = await manejador.save(req.body);
    res.redirect('/')
})
app.get("/productos",async (req,res)=>{

    const resp = await manejador.getAll();

    console.log("productos: ",resp.data)

    res.render("listado",{
        productos: resp.data,
        total: resp.data.length
    })
})

//configurar el socket del lado del backend
const io = new Server(server);
io.on("connection", async(socket)=>{
    console.log("nuevo cliente conectado");
    
    //cada vez que el socket se conecte le enviamos los productos
    socket.emit("productsArray", await manejador.getAll());

    //recibir el producto
    socket.on("newProduct", async(data)=>{
        console.log("nuevo producto: ",data)
        //data es el producto que recibo del formulario
        try {
            const resp = await manejador.save(data);
        } catch (error) {
            console.log("error: ",error)
        }

        //enviar todos los productos actualizados
        io.sockets.emit("productsArray", await manejador.getAll());

    })

    //chat
    
    //enviar los mensajes al cliente
    socket.emit("messagesChat", await chat.getMessages());

    //recibimos el mensaje
    socket.on("newMsg", async (msg)=>{
        console.log("mensaje: ",msg)
        await chat.postMessage(msg)
        //enviamos los mensajes a todos los sockets que esten conectados.
        io.sockets.emit("messagesChat", await chat.getMessages())
    })
})

