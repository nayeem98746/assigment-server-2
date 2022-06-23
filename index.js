const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const { MongoClient } = require('mongodb');
const fileUpload = require('express-fileupload')

const port = process.env.PORT || 5000
app.use(cors());
app.use(express.json());
app.use(fileUpload());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.t8ils.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);


async function run() {
    try {
      await client.connect();
      const database = client.db('Job-protal');
      const applyCollection = database.collection('applys');
      const addserviceCollection = database.collection('addservice');
      const usersCollection = database.collection('users');


    //   app.post('/applys' , async (req , res) => {
    //     console.log('body' ,req.body);
    //     console.log('files' , req.files);
    //     res.json({success: true})
    //   })  

    app.get('/applys', async (req, res) => {
      const cursor = applyCollection.find({});
      const apply = await cursor.toArray();
      res.json(apply);
  });

      app.post('/applys' , async (req , res) => {
        const fristName =  req.body.fristName;
        const lastName =  req.body.lastName;
        const email =  req.body.email
        const phone =  req.body.phone
        const country =  req.body.country
        const pic = req.files.resume
        const picData = pic.data;
        const encodePic = picData.toString('base64')
        const resumeBuffer = Buffer.from(encodePic , 'base64')
        const apply ={
            fristName,
            lastName,
            email,
            phone,
            country,
            resume: resumeBuffer
            
        }
        const result = await applyCollection.insertOne(apply)
        res.json(result)
      })


      app.post('/addservice' , async(req, res) => {
        const addService = req.body
        console.log('hit the 2 api', addService)
        const result = await addserviceCollection.insertOne(addService)
        console.log(result)
        res.json(result)
      })

      app.get('/addservice' , async(req, res) => {
        const cursor = addserviceCollection.find({})
        const addservice = await cursor.toArray()
        res.send(addservice)
      })


      app.post('/users' , async(req,res) => {
        const user = req.body
        const result =await usersCollection.insertOne(user)
        console.log(result);
        res.json(result)
      })
      app.put('/users' , async(req, res) => {
        const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
      })

      app.get('/users/:email' , async(req, res) => {
        const email = req.params.email
        const query = {email: email}
        const user = await usersCollection.findOne(query)
        let isAdmin = false
        if(user?.role == 'admin'){
          isAdmin= true

        }
        res.json({admin: isAdmin })
      })


      app.put('/users/admin' , async (req , res) => {
        const user = req.body;
        const filter = {email: user.email};
        const updateDoc = {$set:{role:'admin'}}
        const result = await usersCollection.updateOne(filter,updateDoc)
        res.json(result)
      })

























  
    } finally {
    //   await client.close();
    }
  }
  run().catch(console.dir)



app.get('/', (req, res) => {
  res.send('Hello job protal')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})