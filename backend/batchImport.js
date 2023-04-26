const { flights, reservations } = require("./data");
// const flightValues = Object.values(flights);
const flightNames = Object.keys(flights);

const flight = flightNames.map((flight) => {
  return {
    _id: flight,
    flight: flight,
    seats: flights[flight],
  };
});

const { MongoClient } = require("mongodb");
require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const reservationsBatchImport = async () => {
  console.log(MONGO_URI);
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("slingAirInfo");
    const result = await db.collection("reservations").insertMany(reservations);

    console.log("success");
    client.close();
  } catch (error) {
    console.log(error);
  }
};

const flightsBatchImport = async () => {
  console.log(MONGO_URI);
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("slingAirInfo");
    const result = await db.collection("flights").insertMany(flight);

    console.log("success");
    client.close();
  } catch (error) {
    console.log(error);
  }
};

reservationsBatchImport();
flightsBatchImport();
