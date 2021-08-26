const express = require("express");
const cors = require("cors");

const app = express();

const db = require("./db");

const PORT = 3005;

app.use(cors());

app.use(express.json());

app.get("/api/v1/restaurants", async (req, res) => {
  try {
    //const results = await db.query("SELECT * FROM restaurants;");

    const restaurantRatingsData = await db.query(
      "SELECT * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating), 1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id;"
    );
    res.status(200).json({
      status: "sucess",
      results: restaurantRatingsData.rows.length,
      data: restaurantRatingsData.rows,
    });
  } catch (e) {
    console.log(e);
  }
});

// Get a Restaurant
app.get("/api/v1/restaurants/:id", async (req, res) => {
  try {
    const restaurant = await db.query(
      "SELECT * from restaurants left join (select restaurant_id, COUNT(*), TRUNC(AVG(rating), 1) as average_rating from reviews group by restaurant_id) reviews on restaurants.id = reviews.restaurant_id where id=$1;",
      [req.params.id]
    );
    const reviews = await db.query(
      "SELECT * FROM reviews where restaurant_id=$1;",
      [req.params.id]
    );

    res.status(200).json({
      status: "success",
      data: {
        restaurant: restaurant.rows[0],
        reviews: reviews.rows,
      },
    });
  } catch (e) {
    console.log(e);
  }
});

app.post("/api/v1/restaurants", async (req, res) => {
  try {
    const results = await db.query(
      "INSERT into restaurants (name, location, price_range) values ($1, $2, $3) returning *;",
      [req.body.name, req.body.location, req.body.price_range]
    );
    res.status(201).json({
      status: "success",
      data: results.rows,
    });
  } catch (e) {
    console.log(e);
  }
});

//Update
app.put("/api/v1/restaurants/:id", async (req, res) => {
  try {
    const results = await db.query(
      "UPDATE restaurants SET name = $1, location= $2, price_range = $3 where id= $4 returning *",
      [req.body.name, req.body.location, req.body.price_range, req.body.id]
    );

    res.status(200).json({
      status: "success",
      length: results.rowCount,
      data: results.rows[0],
    });
  } catch (e) {
    console.log(e);
  }
});

//Delete
app.delete("/api/v1/restaurants/:id", async (req, res) => {
  const results = await db.query(
    "DELETE FROM restaurants where id = $1 returning *;",
    [req.params.id]
  );
  res.status(204).json({
    status: "success",
    length: results.rowCount,
    data: results.rows[0],
  });
});

//addReviews
app.post("/api/v1/restaurants/:id/addReview", async (req, res) => {
  try {
    const newReview = await db.query(
      "INSERT INTO reviews (restaurant_id, name, review, rating) values ($1, $2, $3, $4) returning *;",
      [req.params.id, req.body.name, req.body.review, req.body.rating]
    );

    res.status(201).json({
      status: "success",
      data: {
        review: newReview.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
  }
});

app.listen(PORT, () => {
  console.log(`server started listening to port: ${PORT} `);
});
