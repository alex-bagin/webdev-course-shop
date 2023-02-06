const express = require("express");
const Handlebars = require("handlebars");
const exphbs = require("express-handlebars");
const { allowInsecurePrototypeAccess } = require("@handlebars/allow-prototype-access");
const path = require("path");
const mongoose = require("mongoose");
const homeRoutes = require("./routes/home");
const cardRoutes = require("./routes/card");
const coursesRoutes = require("./routes/courses");
const ordersRoutes = require("./routes/orders");
const addRoutes = require("./routes/add");
const User = require("./models/User");

const app = express();

const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  handlebars: allowInsecurePrototypeAccess(Handlebars),
});

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

app.use(async (req, res, next) => {
  try {
    const user = await User.findById("63dd42840d919f73e32c1853");
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
  }
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

app.use("/", homeRoutes);
app.use("/courses", coursesRoutes);
app.use("/add", addRoutes);
app.use("/orders", ordersRoutes);
app.use("/card", cardRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    const url = `mongodb+srv://alex:iehtd5yKKr2dAQbf@cluster0.rgmovcm.mongodb.net/shop`;
    await mongoose.set("strictQuery", false);
    await mongoose.connect(url, { useNewUrlParser: true });
    const candidate = await User.findOne();

    if (!candidate) {
      const user = new User({
        email: "alexb@gmx.de",
        name: "Alex",
        cart: { items: [] },
      });
      console.log(user);
      await user.save();
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
