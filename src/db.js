require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");
const path = require("path");
const axios = require('axios');
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const { DB_USER, DB_PASSWORD, DB_HOST } = process.env;

const sequelize = new Sequelize(
  `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}/pokemon`,
  {
    logging: false, // set to console.log to see the raw SQL queries
    native: false, // lets Sequelize know we can use pg-native for ~30% more speed
  }
);
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, "/models"))
  .filter(
    (file) =>
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
  )
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, "/models", file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach((model) => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [
  entry[0][0].toUpperCase() + entry[0].slice(1),
  entry[1],
]);
sequelize.models = Object.fromEntries(capsEntries);

// En sequelize.models están todos los modelos importados como propiedades
// Para relacionarlos hacemos un destructuring
const { Pokemon, Types } = sequelize.models;
const PokemonType = sequelize.define(
  "pokemon_type" /* , {
  pkmnName: {
    type: DataTypes.STRING
  },
  typeNames: {
    type: DataTypes.STRING
  },
} */
);
const preCargarBD = async () => {
  const arrDB = [];
  const pkmnDB = await Pokemon.findAll();
  for (const poke of pkmnDB) {
    arrDB.push(poke.dataValues);
  }
  console.log("Base de datos Precargada");
  return arrDB;
};

async function crearPokemon(detallesPokemon) {
  function traerSprite(sprites) {
    if(sprites.other["official-artwork"].front_default !== null){
      return sprites.other["official-artwork"].front_default;
    }else {
      return sprites.front_default
    }      
  }
  async function traerTipo(arrtipos) {
    const resultado = [];
    for (const csm of arrtipos) {
      const detallesTipo = await axios.get(csm.type.url);
      resultado.push(detallesTipo.data);
    }
    return resultado;
  }
  
  try {
    const tipospkmn = await traerTipo(detallesPokemon.types);
    const sprite = await traerSprite(detallesPokemon.sprites);
    if (detallesPokemon)
    if(tipospkmn[1] === undefined){
      return {
        id: detallesPokemon.id,
        name: detallesPokemon.name,
        health: detallesPokemon.stats[0].base_stat,
        strength: detallesPokemon.stats[1].base_stat,
        defense: detallesPokemon.stats[2].base_stat,
        speed: detallesPokemon.stats[5].base_stat,
        height: detallesPokemon.height,
        weight: detallesPokemon.weight,
        pokemon_type: tipospkmn[0].id,        
        pokemon_type_name:tipospkmn[0].name,        
        sprite: sprite,
        made:'pokeapi'
      }
      
    }else{
      return {
        id: detallesPokemon.id,
        name: detallesPokemon.name,
        health: detallesPokemon.stats[0].base_stat,
        strength: detallesPokemon.stats[1].base_stat,
        defense: detallesPokemon.stats[2].base_stat,
        speed: detallesPokemon.stats[5].base_stat,
        height: detallesPokemon.height,
        weight: detallesPokemon.weight,
        pokemon_type: tipospkmn[0].id,
        pokemon_type2: tipospkmn[1].id,
        pokemon_type_name:tipospkmn[0].name,
        pokemon_type2_name:tipospkmn[1].name,
        sprite: sprite,
        made:'pokeapi'
      }
    }
    
      
  } catch (error) {
    console.log("error en crearPokemon");
    console.error(error);
  }
}
async function crearTipo(detallesTipo) {
  try {
    if(detallesTipo.names[4] === "Ombra"){
      detallesTipo.names[4] = "S" + detallesTipo.names[4]
    }
    const nombreMinus = detallesTipo.names[4].name.toLowerCase();    
    
    const creacionTipo = {
      id: detallesTipo.id,
      name: detallesTipo.name,
      nombre: nombreMinus
    };
    return await creacionTipo;
  } catch (error) {
    console.log("error en creacionTipo");
    console.error(error);
  }
}
async function subirPkmn(pkmn) {
  sequelize.sync({ alter: true }).then(async () => {
    try {
      const newpkmn = await Pokemon.create(pkmn);
    } catch (error) {
      console.log("Pokemon ya existe");      
    }
  });
  return { msg: "Pokemon creado con exito!" };
}
async function subirTipo(type) {
  sequelize.sync({ alter: true }).then(async () => {
    try {
      await Types.create(await type);
    } catch (error) {
      console.log("Tipo ya existe");
      console.error(error);
    }
  });
}
async function vincularTablas(tablasavincular) {
  const resRowsPkmn = tablasavincular.rows;
  const pokimons = [];
  for (const row of resRowsPkmn) {
    pokimons.push(row.dataValues);
  }
  for (const pokimon of pokimons) {
    try {
      sequelize.sync({ alter: true }).then(async () => {
        try {
          if (pokimon.pokemon_type2 !== null) {
            await PokemonType.create({
              pokemonId: pokimon.id,
              typeId: pokimon.pokemon_type,
            })
            await PokemonType.create({
              pokemonId: pokimon.id,
              typeId: pokimon.pokemon_type2,
            });
          } else {
            await PokemonType.create({
              pokemonId: pokimon.id,
              typeId: pokimon.pokemon_type,
            });
          }
          
          
        } catch (error) {
          console.log("error al subir a base de datos ");
          console.error(error);
        }
      });
    } catch (error) {
      console.log("Error al relacionar pkmns");
      console.error(error);
    }
  }
}
const actualizarDB = async () => {

try {  
  const resultadoApiType = await axios.get("https://pokeapi.co/api/v2/type")
  .then(async (res) => {
    for (const type of res.data.results) {
      const detallesTipo = await axios.get(type.url).then(async (res) => {
        try {
          const tipo = await crearTipo(res.data);
          return tipo;
        } catch (error) {
          console.log("error creando tipo");
          console.error(error);
        }
      });
      await subirTipo(await detallesTipo);
    }
  });
  const conexionPokeApi = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=1200")
  .then(async (resultado) => {
    for (const pokemon of resultado.data.results) {
      const detallesPokemonCrudo = await axios.get(pokemon.url)
        .then(async (respuesta) => {
          try {
            const pkmnCreado = await crearPokemon(respuesta.data);
  
            return pkmnCreado;
            
          } catch (error) {
            console.log("error al crear pokemon ");
            console.error(error);
          }
        });
      await subirPkmn(await detallesPokemonCrudo);
    }
  }) 
  const resultadoApiLocal = await Pokemon.findAndCountAll();
  await vincularTablas(resultadoApiLocal);
  console.log('Base de Datos Actualizada')
} catch (error) {
  console.error(error)
  console.log('Un Error')
}
  // Creacion Array con pokemones convertidos en objetos, 
  //con toda la info necesaria
  

};
// Aca vendrian las relaciones
// Product.hasMany(Reviews);
Pokemon.belongsToMany(Types, { through: "pokemon_type",  });

Types.belongsToMany(Pokemon, { through: "pokemon_type" });


const pokeDB = preCargarBD().then(async (precarga) => {
  rl.question(
    "Total Pokemones: " + precarga.length + "\nDeseas actualizar la base de datos: (Y/N) " 
       +
      "\n",
    (respuesta) => {
      respuesta === "Y" ? actualizarDB()
                        : respuesta === "N" ? rl.close():null
    })
})
  

rl.on("close", () => {
  console.log("\nBye-bye");
});
module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize, // para importart la conexión { conn } = require('./db.js');
};
