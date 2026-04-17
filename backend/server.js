import express from "express";
import cors from "cors";


const app = express();
app.use(cors())

app.use(express.json());


// ------IMPORT DAS ROTAS------ //

import AuthRouter  from './router/AuthRouter.js';
import UserRouter from './router/UserRouter.js';
import FuncRouter from './router/FuncRouter.js';
import CrachaRouter from './router/CrachaRouter.js';
import DepRouter from './router/DepRouter.js';

// -------REGISTRO DAS ROTAS------- //

app.use("/user", UserRouter)
app.use('/auth', AuthRouter);
app.use('/func', FuncRouter);
app.use('/dep', DepRouter);
app.use('/cracha', CrachaRouter);





// inicializações do server//

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server rodando em: http://localhost:${PORT}`);
})