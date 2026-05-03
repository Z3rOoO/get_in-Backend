import mqtt from "mqtt"

export const connectMQTT = () => {

    const client = mqtt.connect("mqtt://broker.hivemq.com")

    client.on("connect", () => {
        console.log("conectado ao broker")
        client.subscribe(`dispositivos/res/4`)
    })

    client.on("message", async (topic, message) => {
        const [ id, cracha ] = message.toString().split(",")
        console.log(topic)
        console.log(`id : ` + id)
        console.log(`cracha: ` + cracha)
        await fetch(`http://localhost:3000/dispositivos/${id}/${cracha}`)
    })

    client.on("error", (err) => {
        console.error("Erro na conexão MQTT: ", err)
    })

}


