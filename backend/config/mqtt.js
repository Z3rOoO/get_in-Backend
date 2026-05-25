import mqtt from "mqtt"

export const client = mqtt.connect("mqtt://broker.hivemq.com");

export const connectMQTT = () => {


    client.on("connect", () => {
        console.log("conectado ao broker")
        client.subscribe(`get-in-3td/dispositivos/res`)
    })

    client.on("message", async (topic, message) => {
        const [ id, cracha ] = message.toString().split(",")
        console.log(topic)
        console.log(`id : ` + id)
        console.log(`cracha: ` + cracha)
        fetch(`${process.env.API_URL}/dispositivos/${id}/${cracha}`)
    })

    client.on("error", (err) => {
        console.error("Erro na conexão MQTT: ", err)
    })

}


