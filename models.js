'use strict';

const { Sequelize, Model, DataTypes } = require('sequelize');
const fs = require('fs');

// Connect to the Postgre Databases
const db = `postgres://ramiz:1234@localhost:5432/dbv`;
const sequelize = new Sequelize(db);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// Define the tables
class Phone extends Model {}
Phone.init(
  {
    name: DataTypes.STRING,
    company: DataTypes.STRING,
    resolution: DataTypes.STRING,
    size: DataTypes.FLOAT,
    os: DataTypes.STRING,
  },
  { sequelize, modelName: 'Phone', timestamps: false }
);

class Spec extends Model {}
Spec.init(
  {
    name: DataTypes.STRING,
    chipset: DataTypes.STRING,
    ram: DataTypes.INTEGER,
    memory: DataTypes.INTEGER,
    mainCamera: DataTypes.INTEGER,
    frontCamera: DataTypes.INTEGER,
    battery: DataTypes.INTEGER,
  },
  { sequelize, modelName: 'Spec', timestamps: false }
);

// Read Initial Data
let rawdata = fs.readFileSync('phones.json');
let phoneData = JSON.parse(rawdata);

rawdata = fs.readFileSync('specs.json');
let specData = JSON.parse(rawdata);

// Initialize the tables
const initializePhone = async () => {
  await Phone.sync({ force: true });
  console.log('The table for the Phone model was just (re)created!');
  for (let pd of phoneData) {
    await Phone.create(pd);
  }
};

initializePhone();

const initializeSpec = async () => {
  await Spec.sync({ force: true });
  console.log('The table for the Spec model was just (re)created!');
  for (let sd of specData) {
    await Spec.create(sd);
  }
};

initializeSpec();

exports.Phone = Phone;
exports.Spec = Spec;
exports.sequelize = sequelize;
