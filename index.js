const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;

// MongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2spjz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    const database = client.db("ema-john");
    const productsCollection = database.collection("products");

    // GET
    app.get("/products", async (req, res) => {
    //   const page = req.query.page;
    //   const size = req.query.size;
    //   console.log(page,size);
      const result = await productsCollection.find({});
      const products = await result.toArray();
      const count = await result.count();
      const pages = Math.ceil(count / 10);
      const data = {
        pages: pages,
        products: products,
      };
      res.json(data);
    });
    // GET USER DATA
    app.get("/users/:user", async (req, res) => {
      const email = req.params.user;
      const usersCollection = database.collection(email);
      const result = await usersCollection.find({});
      const resultArray = await result.toArray();
      res.json(resultArray);
    });
    app.post("/users/:user", async (req, res) => {
      const email = req.params.user;
      const product = req.body.product;
      const usersCollection = database.collection(email);
      const result = await usersCollection.findOne({ key: product.key });
      if (!result) {
        product.quantity = 1;
        await usersCollection.insertOne(product);
      } else {
        const updateDoc = {
          $set: {
            quantity: result.quantity + 1,
          },
        };
        await usersCollection.updateOne({ key: product.key }, updateDoc);
      }
      const findResult = await usersCollection.find({});
      const resultArray = await findResult.toArray();
      res.send(resultArray);
    });
    app.delete("/users/:user", async (req, res) => {
      const email = req.params.user;
      const key = req.body.key;
      const usersCollection = database.collection(email);
      const result = await usersCollection.deleteOne({key:key});
      const findResult = await usersCollection.find({});
      const resultArray = await findResult.toArray();
      res.send(resultArray);
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from server");
});
app.listen(port, () => {
  console.log("listening", port);
});
