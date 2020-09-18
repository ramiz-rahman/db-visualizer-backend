const express = require('express');
const cors = require('cors');

const { Phone, Spec, sequelize } = require('./models');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.listen(port, () =>
  console.log(`DatabaseVisualizer running on port: ${port}`)
);

app.get('/', (req, res) => res.json({ message: 'Hello World!' }));

// Phone
app.get('/phones', async (req, res) => {
  try {
    const phones = await Phone.findAll();
    res.json(phones);
  } catch (error) {
    console.error(error);
  }
});

app.get('/phone/:phoneId', async (req, res) => {
  const phoneId = req.params.phoneId;
  try {
    const phone = await Phone.findAll({
      where: {
        id: phoneId,
      },
    });
    res.json({ phone });
  } catch (error) {
    console.error(error);
  }
});

app.post('/phone', async (req, res) => {
  try {
    const newPhone = Phone.build(req.body);
    await newPhone.save();
    res.json({ phone: newPhone }); // Returns the new user that is created in the database
  } catch (error) {
    console.error(error);
  }
});

// Spec
app.get('/specs', async (req, res) => {
  try {
    const specs = await Spec.findAll();
    res.json(specs);
  } catch (error) {
    console.error(error);
  }
});

app.get('/spec/:specId', async (req, res) => {
  const specId = req.params.specId;
  try {
    const spec = await Spec.findAll({
      where: {
        id: specId,
      },
    });
    res.json({ spec });
  } catch (error) {
    console.error(error);
  }
});

// Sets
app.get('/union', async (req, res) => {
  const query = `SELECT "name" 
      FROM "Phones"
      UNION 
      SELECT "name" 
      FROM "Specs"`;

  try {
    const [results, metadata] = await sequelize.query(query);
    res.json({ results });
  } catch (error) {
    console.error(error);
  }
});

app.get('/intersection', async (req, res) => {
  const query = `SELECT "name" 
      FROM "Phones"
      INTERSECT
      SELECT "name" 
      FROM "Specs"`;

  try {
    const [results, metadata] = await sequelize.query(query);
    res.json({ results });
  } catch (error) {
    console.error(error);
  }
});

app.get('/difference', async (req, res) => {
  const query = `SELECT "name" 
      FROM "Phones"
      EXCEPT
      SELECT "name" 
      FROM "Specs"`;

  try {
    const [results, metadata] = await sequelize.query(query);
    res.json({ results });
  } catch (error) {
    console.error(error);
  }
});

app.get('/crossjoin', async (req, res) => {
  const query = `SELECT 
        "Phones"."name" AS "Name (A)",
        "Specs"."name" AS "Name (B)"
      FROM "Phones"
      CROSS JOIN "Specs"`;

  try {
    const [results, metadata] = await sequelize.query(query);
    res.json({ results });
  } catch (error) {
    console.error(error);
  }
});

// Joins
app.get('/innerjoin', async (req, res) => {
  const query = `SELECT
      "Phones"."id" AS "Phone ID", "Specs"."id" AS "Spec ID",
      "Phones"."name", "company", "resolution", "size",
      "os", "chipset","ram", "memory",
      "mainCamera" AS "Main Camera", 
      "frontCamera" AS "Front Camera", "battery" 
    FROM "Phones"
    INNER JOIN "Specs"
    ON "Phones"."name" = "Specs"."name"`;

  try {
    const [results, metadata] = await sequelize.query(query);
    res.json({ results });
  } catch (error) {
    console.error(error);
  }
});

app.get('/leftouterjoin', async (req, res) => {
  const query = `SELECT
      "Phones"."id" AS "Phone ID", "Specs"."id" AS "Spec ID",
      "Phones"."name" AS "Name (A)", "Specs"."name" AS "Name (B)",
      "company", "resolution", "size", "os", "chipset",
      "ram", "memory", "mainCamera" AS "Main Camera", 
      "frontCamera" AS "Front Camera", "battery" 
    FROM "Phones"
    LEFT OUTER JOIN "Specs"
    ON "Phones"."name" = "Specs"."name"`;

  try {
    const [results, metadata] = await sequelize.query(query);
    res.json({ results });
  } catch (error) {
    console.error(error);
  }
});

app.get('/rightouterjoin', async (req, res) => {
  const query = `SELECT
      "Phones"."id" AS "Phone ID", "Specs"."id" AS "Spec ID",
      "Phones"."name" AS "Name (A)", "Specs"."name" AS "Name (B)",
      "company", "resolution", "size", "os", "chipset",
      "ram", "memory", "mainCamera" AS "Main Camera", 
      "frontCamera" AS "Front Camera", "battery" 
    FROM "Phones"
    RIGHT OUTER JOIN "Specs"
    ON "Phones"."name" = "Specs"."name"`;

  try {
    const [results, metadata] = await sequelize.query(query);
    res.json({ results });
  } catch (error) {
    console.error(error);
  }
});

app.get('/fulljoin', async (req, res) => {
  const query = `SELECT
      "Phones"."id" AS "Phone ID", "Specs"."id" AS "Spec ID",
      "Phones"."name" AS "Name (A)", "Specs"."name" AS "Name (B)",
      "company", "resolution", "size", "os", "chipset",
      "ram", "memory", "mainCamera" AS "Main Camera", 
      "frontCamera" AS "Front Camera", "battery" 
    FROM "Phones"
    FULL JOIN "Specs"
    ON "Phones"."name" = "Specs"."name"`;

  try {
    const [results, metadata] = await sequelize.query(query);
    res.json({ results });
  } catch (error) {
    console.error(error);
  }
});

// Triggers
app.post('/trigger', async (req, res) => {
  const queryFunc = `
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
  const queryTrigger = `
    CREATE  TRIGGER  "phone_to_spec"
    AFTER INSERT
    ON "Phones"
    FOR EACH ROW
      EXECUTE PROCEDURE add_phone_to_spec();
  `;

  try {
    const [result_1, metadata_1] = await sequelize.query(queryFunc);
    const [result_2, metadata_2] = await sequelize.query(queryTrigger);
    res.json({ result_1, result_2 });
  } catch (error) {
    console.error(error);
  }
});
