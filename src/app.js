import express from 'express'
import mongoose from 'mongoose'
import config from './config/config.js'
import passport from "passport"
import cookieParser from "cookie-parser"

import cartRouter from './routes/cart.routes.js'
import prodRouter from './routes/product.routes.js'
import userRouter from './routes/user.routes.js'
import ticketRouter from './routes/ticket.routes.js'

import UserMongo from "./dao/mongo/user.mongo.js"
import ProdMongo from "./dao/mongo/products.mongo.js"

import productManager from "./dao/servicios/ProductManager.js"

import { Strategy as JwtStrategy } from 'passport-jwt';
import { ExtractJwt as ExtractJwt } from 'passport-jwt';

import __dirname, { authorization, passportCall, transport,createHash, isValidPassword } from "./utils.js"
import initializePassport from "./config/passport.config.js"
import * as path from "path"

import {genAndSetToken, genAndSetTokenEmail, 
  validateTokenResetPass, getEmailFromToken, getEmailFromTokenLogin} from "./jwt/token.js"
  
import UserDTO from './dao/DTOs/user.dto.js'
import {Server} from "socket.io"
import { engine } from "express-handlebars";
import compression from 'express-compression'
import loggerMiddleware from "./loggerMiddleware.js";


import MongoStore from "connect-mongo";
import session from "express-session";
import sessionFileStore from "session-file-store";
import { Products } from './dao/factory.js'


const FileStore = sessionFileStore(session);

const app= express();
const PORT = 8080;
app.use(express.json({ limit: '20mb' }));
app.use(express.json());
app.use(express.urlencoded({extended: true}))

app.use(cookieParser());
app.use(compression());
initializePassport();
app.use(passport.initialize());
app.use(loggerMiddleware);


const httpServer = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})

const socketServer = new Server(httpServer)

//-------------------------------Prueba conexión-------------------------------------------//
socketServer.on("connection", socket => {
    console.log("Socket Conectado")
//------Recibir información del cliente----------//
    socket.on("message", data => {
        console.log(data)
    })
  })
const users = new UserMongo()
const products = new ProdMongo()


app.use("/carts", cartRouter)
app.use("/products", prodRouter)
app.use("/users", userRouter)
app.use("/tickets", ticketRouter)


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

app.use("/api/products", prodRouter);
app.use("/api/cart", cartRouter);
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
  const products = await productManager.getProducts(); // Obtén los productos de tu base de datos
  res.render('product', {
    title: "vista de Productos",
    products: products,
    email: req.session.emailUser,
    rol: req.session.rolUser }); // Renderiza la vista 'product' y pasa los productos como un objeto llamado 'products'
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
