// import { Create, Update, Delete, Read } from "../config/database.js";
import { prisma } from '../config/prisma.js';

class RequisicaoVisitanteController {
    static async Create(req, res) {
        try {
            const { idUsuario, idSetor, motivo, validade, descricao, empresa } = req.body;
            let setores = []
            let limpar = []

            if (!idUsuario || !idSetor) {
                return res.status(400).json({
                    sucesso: false,
                    mensagem: "idUsuario e idSetor são obrigatórios"
                });
            }

            while (idSetor[0] != null) {


                const setorEncontrado = await prisma.setores.findFirst({
                    where: {
                        id: idSetor[0]
                    }
                })

                if (setorEncontrado) {
                    if (idSetor.length == 1) {
                        setores = setores + idSetor.shift()
                        setores = await setores.split(",")
                        console.log(setores)
                    } else {
                        setores = setores + `${idSetor.shift()},`
                    }
                } else {
                    return res.status(400).json({
                        sucesso: false,
                        erro: "não foi encontrado o setor " + idSetor[0]
                    })
                }
            }

            while (setores[0] != null) {
                console.log(setores[0])
                const resultado = await prisma.requisicaoDeVisita.create({
                    data: {
                        idUsuario: Number(idUsuario),
                        idSetor: Number(setores[0]),
                        motivo: motivo || null,
                        validade: validade ? new Date(validade) : null,
                        descricao: descricao || null,
                        empresa: empresa || null,
                        status: "pendente"
                    }
                });

                if (resultado) {
                    if (setores.length == 1) {
                        limpar = await setores.shift()
                        limpar = []
                        console.log("limpando os setores restantes: " + limpar)

                    } else {
                        console.log("excluindo setor: " + setores[0])
                        limpar = await limpar + setores.shift()
                    }
                } else {
                    return res.status(500).json({
                        sucesso: false,
                        erro: "erro ao criar requisicao de visitante do id setor: " + setores[0]
                    })
                }


            }

            return res.status(201).json({
                sucesso: true,
                mensagem: "Requisição de visitante criada com sucesso"
            });

            
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao criar requisição de visitante",
                erro: e.message
            });
        }
    }

    static async Read(req, res) {
        try {
            const resultado = await prisma.requisicaoDeVisita.findMany({
                include: {
                    usuario: true,
                    setores: true
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisições de visitantes listadas com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao listar requisições de visitantes",
                erro: e.message
            });
        }
    }

    static async ReadById(req, res) {
        try {
            const { id } = req.params;

            const resultado = await prisma.requisicaoDeVisita.findUnique({
                where: { id: Number(id) },
                include: {
                    usuario: true,
                    setores: true
                }
            });

            if (!resultado) {
                return res.status(404).json({
                    sucesso: false,
                    mensagem: "Requisição não encontrada"
                });
            }

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisição encontrada com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao buscar requisição",
                erro: e.message
            });
        }
    }

    static async Update(req, res) {
        try {
            const { id } = req.params;
            const { status, motivo, validade, descricao, empresa } = req.body;

            const resultado = await prisma.requisicaoDeVisita.update({
                where: { id: Number(id) },
                data: {
                    status: status || undefined,
                    motivo: motivo || undefined,
                    validade: validade ? new Date(validade) : undefined,
                    descricao: descricao || undefined,
                    empresa: empresa || undefined
                }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisição atualizada com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao atualizar requisição",
                erro: e.message
            });
        }
    }

    static async Delete(req, res) {
        try {
            const { id } = req.params;

            const resultado = await prisma.requisicaoDeVisita.delete({
                where: { id: Number(id) }
            });

            return res.status(200).json({
                sucesso: true,
                mensagem: "Requisição deletada com sucesso",
                data: resultado
            });
        } catch (e) {
            return res.status(500).json({
                sucesso: false,
                mensagem: "Erro ao deletar requisição",
                erro: e.message
            });
        }
    }
}

export default RequisicaoVisitanteController;
