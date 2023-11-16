import express from "express";
import ProdRouter from "./routes/product.routes.js";
import CartRouter from "./routes/cart.routes.js";
import CartManager from "./dao/classes/CartManager.js";
import ProductsManager from "./dao/classes/ProductManager.js";
import mongoose from "mongoose";
import { engine } from "express-handlebars";
import * as path from "path";
import __dirname from "./utils.js";
import userRouter from "./routes/user.routes.js";
import MongoStore from "connect-mongo";
import session from "express-session";
import sessionFileStore from "session-file-store";


const FileStore = sessionFileStore(session);
const product = new ProductsManager();
const cart = new CartManager();



const app= express();
const PORT = 8080;
app.use(express.json({ limit: '20mb' }));
app.use(express.json());
app.use(express.urlencoded({extended: true}))


app.listen(PORT, () =>{
    console.log(`Servidor Express en puerto ${PORT}`)
})


app.use("/api/products", ProdRouter)
app.use('/user', userRouter);



//conexión mongo
mongoose.connect('mongodb+srv://userTest:SPyccTEAFDxZMYdp@cluster0.mfugdwf.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp')
.then(()=>{
  console.log('Conectado a la base de datos')
})
.catch(error=> {
  console.log('error al intentar conectar la base de datos', error)

})

app.use(session({
  store: MongoStore.create({
      mongoUrl: 'mongodb+srv://userTest:SPyccTEAFDxZMYdp@cluster0.mfugdwf.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp',
      mongoOptions : {useNewUrlParser: true , useUnifiedTopology: true}, ttl:4000
  }),
  secret:"claveSecreta",
  resave: false,
  saveUninitialized:false,
}))

app.use("/api/products", ProdRouter);
app.use("/api/cart", CartRouter);
app.use("/api/sessions", userRouter);

//handlebars

app.engine('hbs', engine({ allowProtoPropertiesByDefault: true }));

app.engine("hbs", engine({ extname: '.hbs'}));
app.set("view engine", "hbs");
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));



app.get("/products", async(req, res)=>{
  if(!req.session.emailUser){
    return res.redirect("/login")
  }
  let allProds = await product.getProducts();
  const products = allProds.map(product => product.toJSON());
  res.render(product, {
    title: "vista de Productos",
    products: products,
    email: req.session.emailUser,
    rol: req.session.rolUser
  });
});

//render index

app.get("/", (req,res)=>{
  res.render('index');
})

//render del login

app.get("/login", async ( req, res)=>{
  res.render("login", {
    title: "Inicio de sesión"
  });
});

//ruta para registro /register

app.get("/register", async (req, res)=> {
  res.render("register", {
    title: "vista de Registro"
  });
});

// ruta de perfil /profile
app.get("/profile", async (req, res)=>{
  if(!req.session.emailUser){
    return res.redirect("/login")
  }
  res.render("profile", {
    title: "vista del Prefil Admin",
    first_name: req.session.namUser,
    last_name: req.session.lasNamUser,
    email: req.session.emailUser,
    rol: req.session.rolUser

  });
});
