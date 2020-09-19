'use strict';

const { Sequelize, Model, DataTypes } = require('sequelize');
const fs = require('fs');

// Connect to the Postgre Databases
const user = process.env.USER || 'ramiz';
const pass = process.env.PASSWORD || '1234';
const host = process.env.HOST || 'localhost:5432';
const db = process.env.DB || 'dbv';
const conn = `postgres://${user}:${pass}@${host}/${db}`;
const sequelize = new Sequelize(conn);

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

const initializeSpec = async () => {
  await Spec.sync({ force: true });
  console.log('The table for the Spec model was just (re)created!');
  for (let sd of specData) {
    await Spec.create(sd);
  }
};

// Enable the Trigger
const enableTrigger = async () => {
  const dropFunc = `
    DROP FUNCTION IF EXISTS add_phone_to_spec;
  `;
  const dropTrigger = `
    DROP TRIGGER IF EXISTS "phone_to_spec" ON "Phones";
  `;
  const createFunc = `
  CREATE FUNCTION add_phone_to_spec() 
  RETURNS TRIGGER 
  LANGUAGE PLPGSQL 
  AS $$
  BEGIN
      INSERT INTO "Specs"("name")
      VALUES(NEW."name");

      RETURN NEW;
  END;
  $$
  `;
  const createTrigger = `
    CREATE  TRIGGER  "phone_to_spec"
    AFTER INSERT
    ON "Phones"
    FOR EACH ROW
      EXECUTE PROCEDURE add_phone_to_spec();
  `;

  try {
    await sequelize.query(dropFunc);
    await sequelize.query(dropTrigger);
    await sequelize.query(createFunc);
    await sequelize.query(createTrigger);
  } catch (error) {
    console.log(error);
  }
};

initializePhone().then(initializeSpec).then(enableTrigger);

exports.Phone = Phone;
exports.Spec = Spec;
exports.sequelize = sequelize;
