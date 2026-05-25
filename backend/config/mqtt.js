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
            const response = await fetch(`${process.env.API_URL}/dispositivos/${id}/${cracha}`)
            console.log("Status da resposta:", response.status)
            
            if (!response.ok) {
                const text = await response.text()
                console.error("Resposta de erro:", text)
                client.publish(`get-in-3td/dispositivos/${id}`, "false/ERRO NA API")
                return
            }
            
            const data = await response.json()
            console.log("Resposta do verificarCracha:", data)
        } catch (error) {
            console.error("Erro ao fazer fetch para verificarCracha:", error.message)
            client.publish(`get-in-3td/dispositivos/${id}`, "false/ERRO NA REQUISIÇÃO")
        }
    })

    client.on("error", (err) => {
        console.error("Erro na conexão MQTT: ", err)
    })

}


