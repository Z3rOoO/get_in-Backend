// HASH para senhas e comparação de senhas

import bcrypt from 'bcrypt'; // biblioteca para hashing de senhas
async function hashPassword(password) { // função para criar um hash de uma senha
    try {
        return await bcrypt.hash(password, 10)// o bcrypt é uma biblioteca de hashing de senhas que serve para proteger senhas armazenadas no banco de dados. O número 10 é o custo do hashing, que determina a complexidade do processo (quanto maior, mais seguro, mas também mais lento).
    } catch (error) {
        console.error('Erro ao criar hash da senha:', error)
        throw error
    }
}

async function comparePassword(password, hash) {// função para comparar uma senha com um hash armazenado no banco de dados
    try{
        return await bcrypt.compare(password,hash) // o bcrypt compara a senha fornecida com o hash armazenado, retornando true se corresponderem ou false caso contrário.
    } catch (error) {
        console.error('Erro ao comparar senha:', error)
        return false

    }
}


export { // exporta as funções criadas a cima
    hashPassword,
    comparePassword
}