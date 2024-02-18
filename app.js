const express = require('express')
const crypto = require('node:crypto')
const movies = require('./movies.json')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

// Métodos normales: GET/HEAD/POST
// Métodos complejos: PUT/PATCH/DELETE

// En los métodos complejos, existe el CORS PRE-Flight
// OPTIONS

const app = express()
app.disable('x-powered-by')
app.use(express.json())
// Esta dependencia soluciona los problemas con el CORS
// PERO a costa de poner los origins con asterisco (*)
app.use(cors({
  origin: (origin, callback) => {
    const acceptedOrigins = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://rufen.site'
    ]
    if (acceptedOrigins.includes(origin) || !origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}))

app.get('/movies', (req, res) => {
  // Para habilitar el CORS, es necesario especificarlo en el header
  // de la API. Esto puede ser global o en una ruta específica.

  // const origin = req.header('origin')
  // if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }

  const { genre } = req.query

  if (!genre) return res.json(movies)

  const filteredMovies = movies.filter(
    movie => movie.genre.some(
      movieGenre => movieGenre.toLowerCase() === genre.toLowerCase()
    )
  )
  if (!filteredMovies) return res.json({ error: 'Movies not found', code: '404' })

  res.json(filteredMovies)
})

app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (movie) res.json(movie)
  else res.status(404).json({ error: 'Movie not found' })
})

app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (!result.success) {
    return res.status(422).json({ error: result.error })
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
  }

  // Esto NO es REST, ya que se está almacenando
  // el estado de la aplicación en memoria
  movies.push(newMovie)
  res.status(201).json(newMovie)
})

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) return res.status(422).json({ error: result.error })

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (!movieIndex || movieIndex <= 0) {
    return res.status(404).json({ error: 'Movie ID not found' })
  }

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie
  res.status(200).json(updatedMovie)
})

app.delete('/movies/:id', (req, res) => {
  // const origin = req.header('origin')
  // if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }

  const { id } = req.params

  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) {
    res.status(404).json({ error: 'Movie not found' })
  }

  movies.splice(movieIndex, 1)
  res.status(200).json({ message: 'Movie deleted' })
})

// app.options('/movies/:id', (req, res) => {
//   const origin = req.header('origin')
//   if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
//     res.header('Access-Control-Allow-Origin', origin)
//     res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE')
//   }
//   res.send(200)
// })

const PORT = process.env.PORT ?? 3030

app.listen(PORT, () => {
  console.log('\nServer listening on port http://localhost:' + PORT)
})
