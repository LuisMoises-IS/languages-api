    import app from "./app";

    app.listen(process.env.PORT, ()=>{
        console.log(`Server on, listening to ${process.env.PORT}`);
    });

    /*app.listen(8080,()=>{
        console.log("Server prendido en el puerto 8080");
});*/