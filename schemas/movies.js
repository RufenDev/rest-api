const z = require('zod')

const movieSchema = z.object({
  title: z.string(),
  year: z.number().int().min(1900).max(2025),
  director: z.string(),
  duration: z.number().int().positive(),
  poster: z.string().url(),
  rate: z.number().min(0).max(10).default(0),
  genre: z.array(z.enum(
    ['Drama', 'Action', 'Crime', 'Adventure', 'Sci-Fi', 'Romance', 'Animation', 'Biography']
  ))
})

const validateMovie = object => movieSchema.safeParse(object)

const validatePartialMovie = object => movieSchema.partial().safeParse(object)

module.exports = {
  validateMovie,
  validatePartialMovie
}
