"use strict";

// use this package to generate unique ids: https://www.npmjs.com/package/uuid
const { v4: uuidv4 } = require("uuid");
const { MongoClient } = require("mongodb");
const { flights, reservations } = require("./data");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// -------- returns an array of all flight numbers
const getFlights = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("slingAirInfo");
    const flightsArray = await db.collection("flights").find().toArray();
    const flightNumbers = flightsArray.map((flight) => {
      return flight._id;
    });
    res.status(200).json({
      status: 200,
      data: flightNumbers,
    });
  } catch {
    res.status(400).json({
      status: 400,
      message: "Something went wrong",
    });
  }
};

// ---------- returns all the seats on a specified flight
const getFlight = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const flightId = req.params.flight;

  try {
    await client.connect();
    const db = client.db("slingAirInfo");
    const flightsArray = await db.collection("flights").find().toArray();
    const flight = flightsArray.find((flights) => {
      return flightId === flights.flight;
    });

    if (flight !== undefined) {
      res.status(200).json({
        status: 200,
        message: flight.seats,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Can't find that flight",
      });
    }
    client.close();
  } catch {
    res.status(400).json({
      status: 400,
      message: "Something went wrong",
    });
  }
};

// ------------ returns all reservations
const getReservations = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  try {
    await client.connect();
    const db = client.db("slingAirInfo");
    const allRes = await db.collection("reservations").find().toArray();

    res.status(200).json({
      status: 200,
      data: allRes,
    });
    client.close();
  } catch {
    res.status(400).json({
      status: 400,
      message: "Something went wrong",
    });
  }
};

// --------------- returns a single reservation
const getSingleReservation = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const reservationId = req.params.reservation;

  try {
    await client.connect();
    const db = client.db("slingAirInfo");
    const allRes = await db.collection("reservations").find().toArray();

    const findRes = allRes.find((reservation) => {
      return reservation._id === reservationId;
    });

    if (findRes !== undefined) {
      res.status(200).json({
        status: 200,
        data: findRes,
      });
    } else {
      res.status(404).json({
        status: 404,
        message: "Can't find a reservation with that id",
      });
    }
    client.close();
  } catch {
    res.status(400).json({
      status: 400,
      message: "Something went wrong",
    });
  }
};

// ------------- creates a new reservation
const addReservation = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);

  if (
    !req.body.flight ||
    !req.body.seat ||
    !req.body.givenName ||
    !req.body.surname ||
    !req.body.email
  ) {
    return res.status(404).json({
      status: 404,
      message: "Reservation info missing",
    });
  }
  try {
    await client.connect();
    const db = client.db("slingAirInfo");
    const getRes = await db.collection("reservations").find().toArray();
    const checkSeat = getRes.find((reservation) => {
      return (
        reservation.seat === req.body.seat &&
        reservation.flight === req.body.flight
      );
    });

    if (checkSeat !== undefined) {
      return res.status(400).json({
        status: 400,
        message: "Seat is not available",
      });
    }

    const createdSeat = {
      _id: uuidv4(),
      flight: req.body.flight,
      seat: req.body.seat,
      givenName: req.body.givenName,
      surname: req.body.surname,
      email: req.body.email,
    };

    const updateSeat = await db
      .collection("reservations")
      .insertOne(createdSeat);

    const updatedResult = await db
      .collection("flights")
      .updateOne(
        { _id: req.body.flight, "seats.id": req.body.seat },
        { $set: { "seats.$.isAvailable": false } }
      );
   
    if (updatedResult.matchedCount === 0) {
      return res.status(404).json({ status: 404 });
    } else if (updatedResult.modifiedCount === 0) {
      return res.status(409).json({ status: 409 });
    } else if (
      updatedResult.matchedCount === 1 &&
      updatedResult.modifiedCount === 1
    ) {
      client.close();
      res.status(201).json({
        status: 201,
        message: "Reservation complete!",
        data: createdSeat._id,
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: "Something went wrong",
    });
  }
};

// ------- updates a specified reservation (not finished)
const updateReservation = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);

  try {
    await client.connect();
    const db = client.db("slingAirInfo");

    const _id = req.body._id;
    if (_id === undefined) {
      return res.status(404).json({
        status: 404,
        message: "No Reservation ID Given",
      });
    }

    const foundRes = await db.collection("reservations").findOne({ _id });
    if (!foundRes) {
      return res.status(404).json({
        status: 404,
        message: "Reservation does not exist",
      });
    }

    const flightsArray = await db.collection("flights").find().toArray();
    const flight = flightsArray.find((flights) => {
      return req.body.flight === flights.flight;
    });

    if (!flight) {
      return res.status(404).json({
        status: 404,
        message: "Is your flight entered correctly?",
      });
    }

    const whichSeat = flight.seats.find((seat) => {
      return seat.id === req.body.seat;
    });

    if (!whichSeat) {
      return res.status(404).json({
        status: 404,
        message: "Is your seat entered correctly?",
      });
    }

    if (whichSeat.isAvailable) {
      const updatedNewSeat = await db
        .collection("flights")
        .updateOne(
          { _id: req.body.flight, "seats.id": req.body.seat },
          { $set: { "seats.$.isAvailable": false } }
        );

      const updatedOldSeat = await db
        .collection("flights")
        .updateOne(
          { _id: req.body.flight, "seats.id": foundRes.seat },
          { $set: { "seats.$.isAvailable": true } }
        );
    }

    ////I feel like there is probably a better way to do this? (below)
    if (
      !req.body._id ||
      !req.body.flight ||
      !req.body.seat ||
      !req.body.givenName ||
      !req.body.surname ||
      !req.body.email
    ) {
      return res.status(404).json({
        status: 404,
        message: "We need all of your reservation info to update",
      });
    } else {
      const query = { _id };
      const newValues = {
        $set: {
          _id: req.body._id,
          flight: req.body.flight,
          seat: req.body.seat,
          givenName: req.body.givenName,
          surname: req.body.surname,
          email: req.body.email,
        },
      };

      const updatedRes = await db
        .collection("reservations")
        .updateOne(query, newValues);
    }

    client.close();
    res.status(200).json({
      status: 200,
      message: "Reservation updated!",
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ status: 400, message: "Something went wrong" });
  }
};

// ------------- deletes a specified reservation & seat
const deleteReservation = async (req, res) => {
  const client = new MongoClient(MONGO_URI, options);
  const _id = req.params.reservation;

  try {
    await client.connect();
    const db = client.db("slingAirInfo");

    const findRes = await db.collection("reservations").find().toArray();
    const resToDelete = findRes.find((reservation) => {
      return _id === reservation._id;
    });

    if (resToDelete !== undefined) {
      const seatToUpdate = resToDelete.seat;
      const whereToFindSeat = resToDelete.flight;

      const deleteRes = await db
        .collection("reservations")
        .deleteOne({ _id: _id });

      const flightsArray = await db.collection("flights").find().toArray();
      const whichFlight = flightsArray.find((flights) => {
        return flights._id === whereToFindSeat;
      });

      const updatedSeat = await db
        .collection("flights")
        .updateOne(
          { _id: whereToFindSeat, "seats.id": seatToUpdate },
          { $set: { "seats.$.isAvailable": true } }
        );

      if (updatedResult.matchedCount === 0) {
        return res.status(404).json({ status: 404 });
      } else if (updatedResult.modifiedCount === 0) {
        res.status(409).json({ status: 409 });
      } else if (
        updatedResult.matchedCount === 1 &&
        updatedResult.modifiedCount === 1
      ) {
        res.status(200).json({ status: 200 });
      }
    } else {
      res.status(404).json({
        status: 404,
        message: "Can't identify reservation to delete",
      });
    }
    client.close();
  } catch {
    res.status(400).json({ status: 400, message: "Something went wrong" });
  }
};

module.exports = {
  getFlights,
  getFlight,
  getReservations,
  addReservation,
  getSingleReservation,
  deleteReservation,
  updateReservation,
};
