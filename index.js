const express = require('express')
const cors = require("cors")
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config()

const port = process.env.PORT || 5000;
const app = express()

// middlewares 
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sg7vl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
    try {
        await client.connect();
        const database = client.db("tinyHouse");
        const houseCollection = database.collection("house");
        const orderCollection = database.collection("orders");
        const ratingCollection = database.collection("rating");
        const userCollection = database.collection("user");

        // get all houses 
        app.get("/houses", async (req, res) => {
            const result = await houseCollection.find({}).toArray()
            res.json(result)
        })

        // get a single one 
        app.get("/houses/:id", async (req, res) => {
            const query = { _id: ObjectId(req.params.id) }
            const result = await houseCollection.findOne(query)
            res.json(result)
        })

        // add  a house 
        app.post('/addHouse', async (req, res) => {
            const result = await houseCollection.insertOne(req.body)
            res.json(result)
        })

        // make a admin 
        app.put("/user", async (req, res) => {
            const filter = { email: req.body.email }
            const updaetDoc = { $set: { role: "admin" } }
            const result = await userCollection.updateOne(filter, updaetDoc)
            res.json(result)
        })

        // check admin 
        app.get('/user/:email', async (req, res) => {
            const email = req.params.email
            const query = { email }
            const result = await userCollection.findOne(query)
            let isAdmin = false
            if (result?.role === "admin") {
                isAdmin = true
            }
            res.json({ admin: isAdmin })
        })

        // add  a user 
        app.post('/adduser', async (req, res) => {
            const result = await userCollection.insertOne(req.body)
            res.json(result)
        })


        // delete a house
        app.delete('/houses/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) }
            const result = await houseCollection.deleteOne(query)
            res.send(result)
        })

        // add order to db
        app.post("/addorders", async (req, res) => {
            const data = req.body
            const result = await orderCollection.insertOne(data)
            res.send(result)
        })

        // get user orders 
        app.get("/myorders/:email", async (req, res) => {
            const emailID = req.params.email;
            const query = { email: emailID }
            const result = await orderCollection.find(query).toArray()
            res.json(result)
        })

        // get all orders 
        app.get('/allorders', async (req, res) => {
            const result = await orderCollection.find({}).toArray()
            res.json(result)
        })

        // cancel an order 
        app.delete('/myorders/:id', async (req, res) => {
            const query = { _id: ObjectId(req.params.id) }
            const result = await orderCollection.deleteOne(query)
            res.send(result)
        })

        // update order status
        app.put("/order/update/:id", async (req, res) => {
            const data = req.body
            const updateOrder = {
                $set: {
                    status: data.status
                },
            }
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const result = await orderCollection.updateOne(filter, updateOrder, options)
            res.json(result)

        })

        // post rating 
        app.post("/rating", async (req, res) => {
            const result = await ratingCollection.insertOne(req.body)
            res.json(result)
        })

        // get ratings 
        app.get("/ratings", async (req, res) => {
            const result = await ratingCollection.find({}).toArray()
            res.json(result)
        })


    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.json('running the tiny house server')
})

app.listen(port, () => {
    console.log("listening to the port ", port);
})