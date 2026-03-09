const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const productRoutes = require("./routes/product.routes");
const swaggerUi = require("swagger-ui-express");
const swaggerRouter = require("../swagger");

require("dotenv").config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Routes API
app.use("/products", productRoutes);

// Swagger
app.use("/api-docs", swaggerRouter);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Products Service en ligne sur le port ${PORT}`));