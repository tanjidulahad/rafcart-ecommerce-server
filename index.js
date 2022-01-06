const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const express = require("express");
const app = express();
const port =process.env.PORT || 5000;
const cors = require("cors");
require("dotenv").config();
app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://rimon1:Q9gr3SPYPG5b6XVp@cluster0.hv2ek.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
  try{
    await client.connect();

    const database = client.db("rafcart");
    const productsCollection = database.collection("products");
    const wishlistCollection=database.collection("wishlists");

    // getting all products
    app.get('/products',async(req,res)=>{
        const cursor = productsCollection.find({});
        const result = await cursor.toArray();
        res.json(result);
    })
    //getting a single product
    app.get('/product/:id',async(req,res)=>{
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.json(result);
    })
    //getting cart items
    app.post('/products/byKeys',async(req,res)=>{
      const keys=req.body;
      const ids=keys.map(id =>ObjectId(id));
      const query = { _id: { $in: ids} };  
      const cursor = productsCollection.find(query);
      const result = await cursor.toArray();
      res.json(result)
    })
    //getting product from wishlist
    app.get("/wishlist/:email",async(req,res)=>{
      const email=req.params.email;
      const query = { email: email };
      const cursor = wishlistCollection.find(query);
      const result = await cursor.toArray();
      res.json(result);

    })
    //delet from wishlist
    app.delete('/wishlist/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await wishlistCollection.deleteOne(query);
      res.json(result);
  })
    //add to wishlist
    app.post('/wishlists', async (req, res) => {
      const data = req.body;
      const {productId,email}=data;
      const filter = {productId,email};
      const updateDoc = {

        $set: data,
  
      };
      const options = { upsert: true };
      const result = await wishlistCollection.updateOne(filter,updateDoc,options);
      console.log(result);
      res.json(result);
  });
    //add to product
    app.post('/addtoproduct', async (req, res) => {
      const data = req.body;
      // const {productId,email}=data;
      // const filter = {productId,email};
      // const updateDoc = {

      //   $set: data,
  
      // };
      const options = { upsert: true };
      const result = await productsCollection.insertOne(data);
      console.log(result);
      res.json(result);
  });
  }
  finally{
    // await client.close();
  }

}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})