import express from "express";
import cors from "cors";
import { connectMQTT } from "./config/mqtt.js"
import { env, validateEnv } from "./config/env.js";

validateEnv();

const app = express();
app.use(cors({
    origin(origin, callback) {
        if (!origin || env.corsOrigins.includes("*") || env.corsOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json());

app.use((req, res, next) => {
    const json = res.json.bind(res);

    res.json = (body) => {
        if (env.isProduction && res.statusCode >= 500 && body && typeof body === "object" && "erro" in body) {
            const { erro, ...safeBody } = body;
            return json(safeBody);
        }

        return json(body);
    };

    next();
});

connectMQTT()

// ------IMPORT DAS ROTAS------ //

import AuthRouter  from './router/AuthRouter.js';
import UserRouter from './router/UserRouter.js';
import FuncRouter from './router/FuncRouter.js';
import CrachaRouter from './router/CrachaRouter.js';
import DepRouter from './router/DepRouter.js';
import TagsRouter from './router/TagsRouter.js';
import RequisicaoFuncRouter from './router/RequisicaoFuncRouter.js';
import LogsRouter from './router/LogsRouter.js';
import DispositivosRouter from './router/DispositivosRouter.js';
import RequisicaoVisitanteRouter from './router/RequisicaoVisitanteRouter.js';
import ViewRouter from './router/ViewRouter.js';
import AvatarRouter from './router/AvatarRouter.js';
import PortariaRouter from "./router/PortariaRouter.js"
import SetoresRouter from "./router/SetoresRouter.js"
import VisitanteRouter from "./router/VisitanteRouter.js"
import EmpresasRouter from "./router/EmpresaRouter.js"
import PublicRouter from "./router/PublicRouter.js"
import PermissoesRouter from "./router/PermissoesRouter.js"
import RelatoriosRouter from "./router/RelatoriosRouter.js"

// -------REGISTRO DAS ROTAS------- //

app.use("/user", UserRouter)
app.use('/auth', AuthRouter);
app.use('/func', FuncRouter);
app.use('/dispositivos', DispositivosRouter);
app.use('/dep', DepRouter);
app.use('/cracha', CrachaRouter);
app.use('/tags', TagsRouter);
app.use('/requisicao', RequisicaoFuncRouter);
app.use('/requisicao-visitante', RequisicaoVisitanteRouter);
app.use('/visitante', VisitanteRouter)
app.use('/logs', LogsRouter);
app.use('/views', ViewRouter);
app.use('/avatar', AvatarRouter);
app.use('/portaria', PortariaRouter)
app.use('/setores', SetoresRouter)
app.use('/empresas', EmpresasRouter)
app.use('/public', PublicRouter)
app.use('/permissoes', PermissoesRouter)
app.use('/relatorios', RelatoriosRouter)


app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
});

// inicializações do server//

const PORT = env.port;

app.listen(PORT, () => {
    console.log(`Server rodando em: http://localhost:${PORT}`);
})
