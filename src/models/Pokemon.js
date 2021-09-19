const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('pokemon', {
    id:{
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    health: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    strength: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    defense: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    speed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weight: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pokemon_type: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pokemon_type_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    pokemon_type2: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    pokemon_type2_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sprite: {
      type: DataTypes.STRING,
      allowNull: true
    },
    made: {
      type:DataTypes.STRING,
      allowNull: false
    }
  });
};
