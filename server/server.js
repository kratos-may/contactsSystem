const {PORT,FRONT_URL,URL_DB} = require('./config');
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const routeLoader = require("./routes");

let app = express();
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Cors to connect with frontend
app.use(
    cors({
        origin: FRONT_URL,
        credentials: true,
    })
);

//Routes
app.get("/", function (req, res) {
    res.send("YOUR API IS RUNNING");
});
app = routeLoader.load(app);

//Mongo Connection
mongoose.connect(
    URL_DB,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify:false
    },
    (err, resp) => {
        if (err) throw err;
        console.log("CONNECTED IN: ", URL_DB);
    }
);

//Port where it's running
app.listen(PORT, () => {
    console.log("RUNNING IN PORT: ", PORT);
});