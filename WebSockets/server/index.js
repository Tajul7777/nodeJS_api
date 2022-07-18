const webSocket = require("ws");

const wss = new webSocket.Server({port: 8082});

wss.on("connection", ws => {
    console.log('New client connected!!')

    ws.on("message", data =>{
        console.log(`Client send data to server: ${data}`);
    });
    
    ws.on("close", () =>{
        console.log("Client has disconnnected!!");
    });
});