const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000 ;


//Middlewae
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.olby26b.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const menuCollection = client.db("misamKitchen").collection("menu");
    const userCollection = client.db("misamKitchen").collection("users");
    const reviews = client.db("misamKitchen").collection("reviews");
    const cartCollection = client.db("misamKitchen").collection("carts");

    //users related api
    app.get('/users', async(req, res)=> {
      const allUsers = await userCollection.find().toArray();
      res.send(allUsers)
    })
    app.post('/users', async(req, res)=>{
      const user = req.body;
      //insert email if user doesnot exist
      //You can do this many ways(1. email unique, 2. upsert, 3.simple checking)
      const query = {email: user.email}
      const existingUser = await userCollection.findOne(query);
      if(existingUser){
        return res.send({message: "User already exists", insertedId: null})
      }
      const result = await userCollection.insertOne(user);
      res.send(result)
    })
    app.patch('/users/admin/:id', async(req, res)=> {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      
    })
    app.delete('/users/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)};
      const result = await userCollection.deleteOne(query);
      res.send(result)
    })

    //Menu related api
  app.get('/menu', async(req, res)=>{
    const result = await menuCollection.find().toArray();
    res.send(result)
  })
  app.get('/reviews', async(req, res)=>{
    const result = await reviews.find().toArray();
    res.send(result)
  })
  // cart items
  app.get('/carts', async(req, res)=> {
    const userEmail = req.query.email;
    const query = {email: userEmail}
    const result = await cartCollection.find(query).toArray();
    res.send(result)
  })
  app.post('/carts', async(req, res)=> {
    const cartItem = req.body;
    console.log(cartItem);
    const result = await cartCollection.insertOne(cartItem);
    res.send(result)
  })

  app.delete('/carts/:id', async(req, res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await cartCollection.deleteOne(query);
    res.send(result)
  })

   
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send("Misam's kitchen server is running")
})
app.listen(port, ()=>{
    console.log(`Misam's kitchen server is running on port: ${port}`);
})