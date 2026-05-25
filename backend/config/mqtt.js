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
        const response = await fetch(`${process.env.API_URL}/dispositivos/${id}/${cracha}`)
        const data = await response.json()
        if (data.sucesso === true) {
            console.log("Resposta do verificarCracha:", data)

        } else {
            console.log("Erro ao verificar crachá:", data.mensagem)
            publishMessage(`get-in-3td/dispositivos/${id}`, "false/ERRO NA REQUISIÇÃO")
        }
    })

    client.on("error", (err) => {
        console.error("Erro na conexão MQTT: ", err)
    })

}


