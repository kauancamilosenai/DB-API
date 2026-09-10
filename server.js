import express, { request, response } from "express"
import pool from "./db.js"

const app = express()
app.use(express.json())
//

app.get('/livros', async (request, response) => {
  try{
    const {autor} = request.query
    if(autor){
      const resultado = await pool.query('SELECT * FROM livros WHERE autor = $1', [autor])
      return response.status(200).json(resultado.rows) 
    }

    const resultado = await pool.query('SELECT * FROM livros')
    return response.status(200).json(resultado.rows)
  } 
  catch(error){
    console.error("deu ruim no GET") 
  }
})



app.get('/livros/:id', async (request, response) => {
  try{
    const {id} = request.params
    const resultado = await pool.query('SELECT * FROM livros where id = $1', [id])

    if(resultado.rows.length === 0){
      return response.status(400).json({Error: "id não encontrado"})
    }

    return response.status(200).json(resultado.rows)
  }
  catch(error){
     console.error("deu ruim no GET com ID") 
    }
})



app.post('/livros', async (request, response) => {
  try{
    const {titulo, autor, ano_publicacao, disponivel} = request.body
    console.log(titulo, autor, ano_publicacao, disponivel)

    if(!titulo){
      return response.status(400).json({Error: "titulo faltando..."})
    }
    if(!autor){
      return response.status(400).json({Error: "autor faltando..."})
    }

    const resultado = await pool.query('INSERT INTO livros(titulo, autor, ano_publicacao, disponivel) VALUES ($1, $2, $3, $4) RETURNING *', [titulo, autor, ano_publicacao, disponivel])
    return response.status(201).json(resultado.rows[0])

  } 
  catch(error){ 
    console.error("deu ruim no POST")
    return response.status(500).json({Error: "Erro ao tentar criar um LIVRO"})
  }
})



app.put('/livros/:id', async (request, response) => {
  try{
    const {id} = request.params
    const {titulo, autor, ano_publicacao, disponivel} = request.body

    if(titulo || autor || ano_publicacao || disponivel){
      const tentativa1 = await pool.query('UPDATE livros set titulo = COALESCE($1, titulo), autor = COALESCE($2, autor), ano_publicacao = COALESCE($3, ano_publicacao), disponivel = COALESCE($4, disponivel) where id = $5 RETURNING *', [titulo, autor, ano_publicacao, disponivel, id])
  
      return response.status(200).json(tentativa1.rows)
    }
    else { return response.status(400).json({Error: "se tu quiser alterar precisa colocar as informações primeiro"}) }

  }
  catch(error){
    console.error("deu ruim no PUT ", error)
  }
})



app.delete('/livros/:id', async (request, response) => {
  try{
    const {id} = request.params
    const tentativa = await pool.query('DELETE FROM livros WHERE id = $1', [id])
    return response.status(200).json({DeuBoa: `id ${id} deletado com sucesso`})
  }
  catch(error){
    console.log('deu ruim no DELETE', error)
    return response.status(400).json({Error: "sei la oque por aqui, deu ruim no DELETE"})
  }
})



//
app.listen(9000, ()=>{console.log("alexa aura foi ligada")})