import assert from "node:assert/strict";
import test from "node:test";
import { registerDeviceLog } from "../services/logService.js";

function createMockClient(lastLog = null) {
  const calls = {
    findFirst: [],
    create: [],
    update: [],
  };

  return {
    calls,
    log: {
      async findFirst(args) {
        calls.findFirst.push(args);
        return lastLog;
      },
      async create(args) {
        calls.create.push(args);
        return { id: 1, ...args.data };
      },
      async update(args) {
        calls.update.push(args);
        return { id: args.where.id, ...lastLog, ...args.data };
      },
    },
  };
}

test("registerDeviceLog cria entrada quando nao existe log anterior", async () => {
  const client = createMockClient();
  const eventDate = "2026-06-08T12:00:00.000Z";

  const result = await registerDeviceLog({
    idDispositivo: 7,
    idUsuario: 11,
    data: eventDate,
  }, client);

  assert.equal(result.action, "entrada");
  assert.equal(client.calls.create.length, 1);
  assert.equal(client.calls.update.length, 0);
  assert.equal(client.calls.create[0].data.idDispositivo, 7);
  assert.equal(client.calls.create[0].data.idUsuario, 11);
  assert.equal(client.calls.create[0].data.dataDeEntrada.getTime(), new Date(eventDate).getTime());
  assert.equal(client.calls.create[0].data.dataDeSaida, null);
});

test("registerDeviceLog fecha saida quando existe log aberto", async () => {
  const lastLog = {
    id: 42,
    idDispositivo: 7,
    idUsuario: 11,
    dataDeEntrada: new Date("2026-06-08T10:00:00.000Z"),
    dataDeSaida: null,
  };
  const client = createMockClient(lastLog);
  const eventDate = "2026-06-08T18:00:00.000Z";

  const result = await registerDeviceLog({
    idDispositivo: 7,
    idUsuario: 11,
    data: eventDate,
  }, client);

  assert.equal(result.action, "saida");
  assert.equal(client.calls.create.length, 0);
  assert.equal(client.calls.update.length, 1);
  assert.deepEqual(client.calls.update[0].where, { id: 42 });
  assert.equal(client.calls.update[0].data.dataDeSaida.getTime(), new Date(eventDate).getTime());
});

test("registerDeviceLog cria nova entrada quando ultimo log ja esta fechado", async () => {
  const lastLog = {
    id: 42,
    idDispositivo: 7,
    idUsuario: 11,
    dataDeEntrada: new Date("2026-06-08T10:00:00.000Z"),
    dataDeSaida: new Date("2026-06-08T12:00:00.000Z"),
  };
  const client = createMockClient(lastLog);
  const eventDate = "2026-06-09T09:00:00.000Z";

  const result = await registerDeviceLog({
    idDispositivo: 7,
    idUsuario: 11,
    data: eventDate,
  }, client);

  assert.equal(result.action, "entrada");
  assert.equal(client.calls.create.length, 1);
  assert.equal(client.calls.update.length, 0);
  assert.equal(client.calls.create[0].data.dataDeEntrada.getTime(), new Date(eventDate).getTime());
  assert.equal(client.calls.create[0].data.dataDeSaida, null);
});
