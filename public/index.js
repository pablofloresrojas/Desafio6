console.log("index JS funcionando")

const socketClient = io();

//enviar producto a traves de sockets
const productForm = document.getElementById("formProducto");
productForm.addEventListener("submit", (event)=>{
    event.preventDefault();
    const product = {
        title: document.getElementById("title").value,
        price: document.getElementById("price").value,
        thumbnail: document.getElementById("thumbnail").value
    }
     console.log("product",product)
    //enviar el producto por medio de socket
    socketClient.emit("newProduct", product);
});

const listadoContainer = document.getElementById("listadoContainer");

socketClient.on("productsArray", async(msg)=>{
    console.log("Data recibida por socket: ",msg)
    const templateTable = await fetch("./templates/productos.handlebars");
    console.log(templateTable)
    //convertimos a formato del template
    const templateFormat = await templateTable.text();
    // console.log(template)
    const template = Handlebars.compile(templateFormat);
    //generamos el html con el template y con los datos de los productos
    const html = template({productos:msg.data});
    listadoContainer.innerHTML = html;
})

const msg = document.getElementById("messageChat")
msg.addEventListener("focus", function(e){
    console.log("estoy en el foco de mensaje",e.target.value)
    //capturar el nombre del usuario
    if(document.getElementById("username").innerHTML===""){
        Swal.fire({
            title:"Bienvenido al sistema de chat",
            text:"Para continuar, por favor ingrese su e-mail",
            input:"text",
            allowOutsideClick: false
        }).then(response=>{
            document.getElementById("username").innerHTML = response.value;
        })
    }
})

const emailRegex = 
 new RegExp(/^[A-Za-z0-9_!#$%&'*+\/=?`{|}~^.-]+@[A-Za-z0-9.-]+$/, "gm");

//enviar un mensaje a nuestro servidor
const chatForm = document.getElementById("chatForm");

chatForm.addEventListener("submit",(event)=>{
    //prevenir que se recarge la pagina cuando se envia el formulario
    event.preventDefault();

    let continuar=false

    if(document.getElementById("username").innerHTML===""){
        Swal.fire({
            title:"Bienvenido al sistema de chat",
            text:"Para continuar, por favor ingrese su e-mail",
            input:"text",
            inputPlaceholder: "Ingrese su e-mail",
            allowOutsideClick: false,
            preConfirm: function (email) {
                console.log("email: ",email)
                return new Promise(function (resolve, reject) {
                    if (!emailRegex.test(email)) {
                        alert("Formato de correo no válido");
                        reject("formato de correo no valido");
                    } else {
                        console.log("resolve")
                        resolve()
                    }
                })
            }
        }).then(response=>{
            if (response.isConfirmed) {
                document.getElementById("username").innerHTML = response.value;
                continuar=true
              } else if (response.isDenied) {
                continuar=false
              }
        }).catch((error)=>{
            console.log("error:", error)
            swal.close();
        })
    }else{
        continuar=true
    }

    if(continuar){
        const message = {
            email:document.getElementById("username").innerHTML,
            fecha:new Date().toLocaleString().
            replace(/T/, ' ').      // replace T with a space
            replace(/\..+/, ''),
            mensaje:document.getElementById("messageChat").value
        }
        document.getElementById("messageChat").value=""
        //envia nuevo mensaje
        socketClient.emit("newMsg", message)
    }
    
    
})
const chatContainer = document.getElementById("chatContainer");

socketClient.on("messagesChat",async (messages)=>{
    console.log(messages)
    const templateTable = await fetch("./templates/mensajes.handlebars");
    console.log(templateTable)
    //convertimos a formato del template
    const templateFormat = await templateTable.text();
    // console.log(template)
    const template = Handlebars.compile(templateFormat);
    //generamos el html con el template y con los datos de los productos
    const html = template({mensajes:messages.data});
    chatContainer.innerHTML = html;
})