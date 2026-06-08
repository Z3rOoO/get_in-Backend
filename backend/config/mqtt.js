import mqtt from "mqtt";
import { env } from "./env.js";
import { verifyDeviceAccess } from "../services/deviceAccessService.js";

let mqttClient = null;
let listenersRegistered = false;

export function getMqttClient() {
  if (!mqttClient) {
    mqttClient = mqtt.connect(env.mqttBrokerUrl);
  }

  return mqttClient;
}

export function publishDeviceMessage(deviceId, message) {
  const topic = `${env.mqttCommandTopicPrefix}/${deviceId}`;
  getMqttClient().publish(topic, message);
}

export const client = {
  publish(topic, message) {
    return getMqttClient().publish(topic, message);
  },
  subscribe(topic, callback) {
    return getMqttClient().subscribe(topic, callback);
  },
  on(event, callback) {
    return getMqttClient().on(event, callback);
  },
};

export const connectMQTT = () => {
  const activeClient = getMqttClient();

  if (listenersRegistered) {
    return activeClient;
  }

  listenersRegistered = true;

  activeClient.on("connect", () => {
    console.log("conectado ao broker");
    activeClient.subscribe(env.mqttResponseTopic, (error) => {
      if (error) {
        console.error("Erro ao assinar topico MQTT:", error.message);
      }
    });
  });

  activeClient.on("message", async (topic, message) => {
    if (topic !== env.mqttResponseTopic) {
      return;
    }

    const [id, cracha] = message.toString().split(",");

    try {
      const result = await verifyDeviceAccess({
        id,
        cracha,
        publish: publishDeviceMessage,
      });

      console.log("Validacao MQTT processada:", result.statusCode);
    } catch (error) {
      console.error("Erro ao processar mensagem MQTT:", error.message);
    }
  });

  activeClient.on("error", (error) => {
    console.error("Erro na conexao MQTT:", error.message);
  });

  return activeClient;
};
