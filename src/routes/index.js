const { Router } = require("express");
// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const pokemonController = require("../controllers/pokemonController");
const typesController = require("../controllers/typesController");
const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.get("/pokemons", pokemonController.obtenerPokemons);
router.get("/pokemons/:id", pokemonController.obtenerPorId);
router.post("/pokemons", pokemonController.crearPokemon);
router.put("/pokemons/:id", pokemonController.editarPokemon);
router.delete("/pokemons/:id", pokemonController.eliminarPokemon);
router.get("/types", typesController.obtenerTypes);

module.exports = router;
