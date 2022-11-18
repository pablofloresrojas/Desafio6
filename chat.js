const fs = require("fs");

class Chat {

    constructor(filename){
        this.filename=filename
    }

    async postMessage(mensaje){
        try {
            if(fs.existsSync(this.filename)){
                const resp = await this.getMessages();
                const mensajes = resp.data
                if(mensajes.length>0){
                    mensajes.push(mensaje);
                    await fs.promises.writeFile(this.filename, JSON.stringify(mensajes,null,2));
                }else{
                    await fs.promises.writeFile(this.filename, JSON.stringify([mensaje],null,2));
                }
            }else{
                await fs.promises.writeFile(this.filename, JSON.stringify([mensaje],null,2));                
            }
            return {status:200,message:"Mensaje enviado",data:mensaje};
        } catch (error) {
            console.log("error al guardar: ",error);
            throw {status:400,message:"Error al guardar el archivo",data:null,error:error};
        }
    }

    async getMessages(){
        try {
            const contenido = await fs.promises.readFile(this.filename,"utf-8");
           if(contenido.length>0){
                const mensajes = JSON.parse(contenido);
                return {status:200,message:"Mensajes",data:mensajes};
           }else{
                return {status:200,message:"No hay mensajes",data:[]};
           }
        } catch (error) {
            throw {status:400,message:"Error al leer el archivo"};
        }
    }

}


module.exports = Chat;