const { Pokemon, conn } = require("../db.js");

async function subirPkmn(pkmn) {
  conn.sync({ alter: true }).then(async () => {
    try {
      const newpkmn = await Pokemon.create(await pkmn); //.then(()=> {});
      console.log(newpkmn);
    } catch (error) {
      console.log("Pokemon ya existe");
      console.error(error);
    }
  });
  return { msg: "Pokemon creado con exito!" };
}
async function allPkmn() {
  const arrDB = [];
  const pkmnDB = await Pokemon.findAll();
  for (const poke of pkmnDB) {
    arrDB.push(poke.dataValues);
  }
  return arrDB;
}
async function filtrarName(arr, toSearch) {
  try {
    const resultados = [];
    for (let i = 0; i < arr.length; i++) {
      for (const key in arr[i]) {
        if (key === "name" && arr[i][key].includes(toSearch))
          resultados.push(arr[i]);
      }
    }
    if (resultados.length === 0) {
      resultados.push({ msj: "Sin coincidencias" });
    }
    return resultados;
  } catch (error) {
    console.log("error al buscar por nombre");
    console.error(error);
  }
}
async function traerIdLibre() {
  //Solucion Provisional
  const allPokemon = await allPkmn();
  return allPokemon.length;
}

exports.crearPokemon = async (req, res) => {
  try {
    // Encontrar un ID disponible para el nuevo pokemon
    const newId = await traerIdLibre();
    const nuevoPokemon = await Object.assign({ id: newId }, req.body);
    //const subirPokemon = await subirPkmn(nuevoPokemon)
    const intento = await subirPkmn(await nuevoPokemon);
    res.json(intento);
  } catch (error) {
    console.log("Hubo un error al poster un pokemon");
    console.error(error);
  }
};
exports.obtenerPokemons = async (req, res) => {
  try {
    const allPokemon = await allPkmn();
    if (Object.keys(req.query).length === 0) {
      const pag = [
        //...arrpkmn,
        ...allPokemon,
      ].slice(0, 12);
      res.json(pag);
    } else if (req.query.name) {
      const resultado = await filtrarName(allPokemon, req.query.name);
      if (resultado.length === 0) resultado.msj = "Sin Coincidencias";
      res.json(resultado);
    } else if (req.query.all && req.query.all === "pls") {
      res.json(allPokemon);
    } else {
      res.json({ msj: "dafuq r u doin?" });
    }
  } catch (error) {
    console.log("Error en /pokemons");
    console.error(error);
  }
};
exports.obtenerPorId = async (req, res) => {
  try {
    const pkmn = await Pokemon.findByPk(req.params.id);
    if (pkmn === null) {
      res.json({ msg: "Pokemon no encontrado" });
    } else {
      res.json(pkmn.dataValues);
    }
  } catch (error) {
    console.error(error);
  }
};
exports.editarPokemon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const {
      name,
      health,
      strength,
      defense,
      speed,
      height,
      weight,
      pokemon_type,
      pokemon_type2,
      sprite,
    } = req.body;

    const pokimones = await Pokemon.findAll({
      where: {
        id,
      },attributes: [
        "name",
        "health",
        "strength",
        "defense",
        "speed",
        "height",
        "weight",
        "pokemon_type",
        "pokemon_type2",
        "sprite",
      ],
     
    });
    const minusName = name.toLowerCase()

    if (pokimones.length > 0) {
      pokimones.forEach(async (pok) => {
        try {
          await pok.update({
            id:req.params.id,
            name: minusName,
            health,
            strength,
            defense,
            speed,
            height,
            weight,
            pokemon_type,
            pokemon_type2,
            sprite,
          });
        } catch (error) {
          console.error(error);
        }
      });
    }
    return res.json({
      msj: "Pokemon Actualizado con exito",
      data: pokimones,
    });

    /* const { name, health, strength, defense, speed, height, weight, pokemon_type, pokemon_type2, sprite} = req.body
    const newPokemon = {};
    if(name){
      newPokemon.name = name;
      newPokemon.health = health;
      newPokemon.strength = strength;
      newPokemon.defense = defense;
      newPokemon.speed = speed;
      newPokemon.height = height;
      newPokemon.weight = weight;
      newPokemon.pokemon_type = pokemon_type;
      newPokemon.pokemon_type2 = pokemon_type2;
      newPokemon.sprite = sprite;
    }  */
    // Revisar Id

    /* .then(resul => {
      conn.sync({ alter: true }).then(async () => {
        const updatePkmn = await Pokemon.update({resul})
      })
    }); */
    /* if(!pkmn){
      return res.status(404).json({msg:'Pokemon no encontrado'})
    } */

    //const nuevoPokemon = await Object.assign({ id: req.params.id }, newPokemon);
    //const pkmn = await Pokemon.findByPk(req.params.id)
    /* const selector = { where:{id: req.params.id} }
      const updatePkmn = await Pokemon.update(newPokemon, selector) */
  } catch (error) {
    console.error(error);
  }
};
exports.eliminarPokemon = async (req, res) => {
  conn.sync({ alter: true }).then(async () => {
    try {
      const pkmn = await Pokemon.findByPk(req.params.id).then(async () => {
        const resDelete = await Pokemon.destroy({
          where: { id: req.params.id },
        });
        if (resDelete) {
          res.json({ msg: "Pokemon Eliminado con exito" });
        } else {
          res.json({ msg: "Pokemon no encontrado" });
        }
      });
    } catch (error) {
      console.error(error);
    }
  });
};
