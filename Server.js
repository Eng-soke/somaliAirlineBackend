const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

// Handle CORS before other middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());

// MongoDB connection with better timeout handling
mongoose.connect("mongodb+srv://test:test@cluster0.gvdj4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 10s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const userRoute = require("./routes/userRoutes");
app.use(userRoute);


const adminRouter = require("./routes/adminRoute");
app.use(adminRouter);


const reportRouter = require("./routes/report")
app.use(reportRouter)

const bookingSchema = require("./model/flight");

app.get('/', (req,res)=>{
  res.send("Welcome to the API")
})

app.get("/bookings/totalPrice", async (req, res) => {
  try {
    const totalPrice = await bookingSchema.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$price" }
        }
      }
    ]);

    res.send({ totalPrice: totalPrice[0]?.total || 0 });
  } catch (error) {
    res.status(500).send({ error: "Failed to calculate total price" });
  }
});


app.get("/passanger/total", async (req, res) => {
  try {
    const passanger = await bookingSchema.countDocuments();
    res.send({ passanger });
  } catch (error) {
    res.status(500).send({ error: "Failed to count passengers" });
  }
});




app.post("/create", async (req, res)=>{
    const booking = bookingSchema(req.body)
    const savebookin = await booking.save()
    if(savebookin){
        res.send("booking has been successfully")
    }
})


app.get("/results", async (req, res)=>{
    try {
        const getData = await bookingSchema.find()
        res.send(getData)
    } catch (error) {
        res.status(500).send({ error: "Failed to fetch flights data" });
        console.error("Error fetching flights:", error);
    }
})




app.listen(1000, () => {
  console.log("Server is running on port 1000");
});