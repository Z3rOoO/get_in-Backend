import express from "express";
import cors from "cors";


const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'options'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json());


// ------IMPORT DAS ROTAS------ //

import AuthRouter  from './router/AuthRouter.js';
import UserRouter from './router/UserRouter.js';
import FuncRouter from './router/FuncRouter.js';
import CrachaRouter from './router/CrachaRouter.js';
import DepRouter from './router/DepRouter.js';
import TagsRouter from './router/TagsRouter.js';
import RequisicaoFuncRouter from './router/RequisicaoFuncRouter.js';
import DispositivosRouter from './router/DispositivosRouter.js';
import LogsRouter from './router/LogsRouter.js';
import RequisicaoVisitanteRouter from './router/RequisicaoVisitanteRouter.js';

// -------REGISTRO DAS ROTAS------- //

app.use("/user", UserRouter)
app.use('/auth', AuthRouter);
app.use('/func', FuncRouter);
app.use('/dep', DepRouter);
app.use('/cracha', CrachaRouter);
app.use('/tags', TagsRouter);
app.use('/requisicao', RequisicaoFuncRouter);
app.use('/requisicao-visitante', RequisicaoVisitanteRouter);
app.use('/dispositivos', DispositivosRouter);
app.use('/logs', LogsRouter);


app.get("/health", (req, res) => {
    res.status(200).json({ ok: true });
});

// inicializações do server//

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server rodando em: http://localhost:${PORT}`);
})