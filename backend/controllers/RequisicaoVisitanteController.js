import { Create, Update, Delete , Read } from "../config/database";

class RequisicaoController{
    static async Create(req, res){
    //     idUsuario INT NOT NULL,
    // idDepartamento INT NOT NULL,
    // status ENUM('pendente','aprovado','recusado') DEFAULT 'pendente',
        try {
            const { idUsuario, idDepartamento} = req.body
            
            const dado = {
                idUsuario,
                idDepartamento
            }

            const result = await Create('')
        } catch (e){
            
        }
    }
}