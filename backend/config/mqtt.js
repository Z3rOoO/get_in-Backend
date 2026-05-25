import mqtt from "mqtt"

export const client = mqtt.connect("mqtt://broker.hivemq.com");

export const connectMQTT = () => {


    client.on("connect", () => {
        console.log("conectado ao broker")
        client.subscribe(`get-in-3td/dispositivos/res`)
    })

    client.on("message", async (topic, message) => {
        const [id, cracha] = message.toString().split(",")
        console.log(topic)
        console.log(`id : ` + id)
        console.log(`cracha: ` + cracha)
        try {
            const response = await fetch(`https://get-in-ilp5.onrender.com/dispositivos/${id}/${cracha}`)
            console.log("Status da resposta:", response.status)
            
            if (response.ok) {
                const data = await response.json()
                console.log("Resposta do verificarCracha:", data)
            } else {
                const text = await response.text()
                console.error("Resposta de erro:", text)
            }
        } catch (error) {
            console.error("Erro ao fazer fetch para verificarCracha:", error.message)
        }
    })

    client.on("error", (err) => {
        console.error("Erro na conexão MQTT: ", err)
    })

}


