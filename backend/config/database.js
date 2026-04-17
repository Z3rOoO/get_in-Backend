// =============================================
// CONFIGURAÇÃO DA CONEXÃO COM O BANCO DE DADOS
// =============================================
// O mysql2 é usado por ter suporte a Promises (async/await),
// o que facilita muito o código assíncrono no Node.js.

import mysql from 'mysql2/promise';
import dotenv from 'dotenv/config';


// Cria um "pool" de conexões.
// Um pool reutiliza conexões abertas ao invés de abrir uma nova a cada query,
// o que é mais eficiente e evita sobrecarregar o banco.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    // Número máximo de conexões simultâneas no pool
    connectionLimit: 10,

    // Retorna valores numéricos como números JS (não como strings)
    typeCast: true,
});

async function getConnection() { // função para obter uma conexão do pool
    return pool.getConnection();
}

async function testConnection() { // função para testar a conexão com o banco
    try {
        const connection = await getConnection();
        console.log('Conexão com o banco de dados bem-sucedida!');
        connection.release(); // libera a conexão de volta para o pool
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
    }
}
testConnection(); // testa a conexão ao iniciar o aplicativo


// Funções CRUD (Create, Read, Update, Delete) para interagir com o banco de dados.
async function Read(table, where = null) { // lê dados de uma tabela, pode ser filtrado ou não
    const connection = await getConnection();// cria conexção com o pool do banco de dados
    try {
        let query = `SELECT * FROM ${table}`; // comando SQL para selecionar todos os dados da tableda
        if (where) { // se houver um filtro, adiciona a cláusula WHERE
            query += ` WHERE ${where}`;// aplica o filtro no comando do SQL
        }
        const [rows] = await connection.query(query); // executa a query e obtém os resultados
        return rows; // retorna os resultados
    } finally {
        connection.release(); // libera a conexão de volta para o pool
    }
}

async function Create(table, data) { // função para criar um novo registro em uma tabela
    const connection = await getConnection()

    try {
        const columns = Object.keys(data).join(', ')// separa as chaves dentro no JSON
        const placeholders = Array(Object.keys(data).length).fill('?').join(', ') // cria uma string de placeholders para os valores (ex: "?, ?, ?") auxilia na construção da query SQL
        const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})` // comando SQL para inserir um novo registro na tabela
        const values = Object.values(data) // obtem os valores do objeto data para serem inseridos na tabela ex: {name, age} => ['João', 30]
        const [result] = await connection.query(query, values) // efaz o query com os dados corretos e obtem o resultado da inserção
        return result.insertId // retorna o ID do novo registro inserido
    } finally {
        connection.release() // libera a conexão de volta para o pool
    }
}

async function Update(table, data, where) { //função para arualizar um registro e, uma tabela
    const connection = await getConnection()

    try {
        const set = Object.keys(data).map(key => `${key} = ?`).join(', ') // ele substitui as chaves do objeto data por placeholders para a query SQL (ex: "name = joão,age = 30) => "name = ?, age = ?")
        const query = `UPDATE ${table} SET ${set} WHERE ${where}` // comando SQL para arualizar o registro filtrando pelo objeto desejado
        const values = Object.values(data)//obtem os valores do objeto data para serem usados no query
        const [result] = await connection.query(query, values)//ele faz o query com os dados corretos e obtem os resultados
        return result.affectedRows // retorna o número de linhas afetadas pela atualização
    } finally {
        connection.release() // libera a conexão de volta para o pool
    }
}

async function Delete(table, where) { // funcção para deletar um registro de uma tabela
    const connection = await getConnection()

    try {
        const query = `DELETE FROM ${table} WHERE ${where}` // comando do SQL para deletar um registro
        const [result] = await connection.query(query) // executa a query e obtém o resultado da deleção
        return result.affectedRows // retorna o número de linhas afetadas pela deleção
    } finally {
        connection.release() // libera a conexão de volta para o pool
    }
}
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

async function FindOne(table, where, values) {// função para pesquisar se um objeto já existe por parametros
    const connection = await getConnection();

    try {
        const query = `SELECT * FROM ${table} WHERE ${where} LIMIT 1`;//cria o query para ser executado
        const [rows] = await connection.query(query, values);
        return rows[0];
    } finally {
        connection.release();
    }
}


export { // exporta as funções criadas a cima
    getConnection,
    Read,
    Create,
    Update,
    Delete,
    hashPassword,
    comparePassword,
    FindOne
}