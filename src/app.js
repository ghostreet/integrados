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

import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import __dirname, { authorization, passportCall, transport } from "./utils.js"
import initializePassport from "./config/passport.config.js"
import * as path from "path"

import {genAndSetToken, genAndSetTokenEmail, 
  validateTokenResetPass, getEmailFromToken, getEmailFromTokenLogin} from "./jwt/token.js"
  
import UserDTO from './dao/DTOs/user.dto.js'
import {Server} from "socket.io"
import { engine } from "express-handlebars";
import loggerMiddleware from "./loggerMiddleware.js";

import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUIExpress from 'swagger-ui-express'

const app= express();
const PORT = 8080;

const users = new UserMongo()
const products = new ProdMongo()

mongoose.connect(config.mongo_url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: "Secret-key"
}

passport.use(
  new JwtStrategy(jwtOptions, (jwt_payload, done)=>{
      const user = users.findJWT((user) =>user.email ===jwt_payload.email)
      if(!user)
      {
          return done(null, false, {message:"Usuario no encontrado"})
      }
      return done(null, user)
  })
)


//conexión mongo
/*mongoose.connect('mongodb+srv://userTest:SPyccTEAFDxZMYdp@cluster0.mfugdwf.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp')
.then(()=>{
  console.log('Conectado a la base de datos')
})
.catch(error=> {
  console.log('error al intentar conectar la base de datos', error)

})*/







import MongoStore from "connect-mongo";
import session from "express-session";



app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs', engine({ allowProtoPropertiesByDefault: true, extname: '.hbs' }));
app.set("view engine", "hbs");
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
initializePassport();
app.use(passport.initialize());


const httpServer = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
const swaggerOptions = {
  definition:{
      openapi:'3.0.1',
      info:{
          title: 'Documentación API',
          description:'Documentación realizada con Swagger en Proyecto Backend Coderhouse'
      }
  },
  apis:[`src/docs/users.yaml`,
        `src/docs/products.yaml`,
        `src/docs/tickets.yaml`,
        `src/docs/carts.yaml`]
}
const specs = swaggerJSDoc(swaggerOptions)
app.use("/apidocs", swaggerUIExpress.serve, swaggerUIExpress.setup(specs))


const socketServer = new Server(httpServer)

//-------------------------------Prueba conexión-------------------------------------------//
socketServer.on("connection", socket => {
    console.log("Socket Conectado")
//------Recibir información del cliente----------//
    socket.on("message", data => {
        console.log(data)
    })
//------Enviar información al cliente------------//

  socket.on("newProd", (newProduct) => {
    products.addProduct(newProduct)
    socketServer.emit("success", "Producto Agregado Correctamente");
});
socket.on("updProd", ({id, newProduct}) => {
    products.updateProduct(id, newProduct)
    socketServer.emit("success", "Producto Actualizado Correctamente");
});
socket.on("delProd", (id) => {
    products.deleteProduct(id)
    socketServer.emit("success", "Producto Eliminado Correctamente");
});

socket.on("newEmail", async({email, comment}) => {
    let result = await transport.sendMail({
        from:'Chat Correo <srpruebascoderh@gmail.com>',
        to:email,
        subject:'Correo con Socket y Nodemailer',
        html:`
        <div>
            <h1>${comment}</h1>
        </div>
        `,
        attachments:[]
    })
    socketServer.emit("success", "Correo enviado correctamente");
});
//-----------------------------Enviar información al cliente----------------------------------//
socket.emit("test","mensaje desde servidor a cliente, se valida en consola de navegador")
//--------------------------------------------------------------------------------------------//
})  
//Prueba Back con endpoint
app.use("/carts", cartRouter)
app.use("/products", prodRouter)
app.use("/users", userRouter)
app.use("/tickets", ticketRouter)

//Prueba Front
app.post("/login", async (req, res) => {
const { email, password } = req.body;
const emailToFind = email;
const user = await users.findEmail({ email: emailToFind });
if (!user || user.password !== password) {
  return res.status(401).json({ message: "Error de autenticación" });
}
const token = genAndSetToken(res, email, password);
const userDTO = new UserDTO(user);
const prodAll = await products.get()
res.json({ token, user: userDTO, prodAll});
});

app.post("/api/register", async(req,res)=>{
const {first_name, last_name, email,age, password, rol} = req.body
const emailToFind = email
const exists = await users.findEmail({ email: emailToFind })
if(exists) return res.status(400).send({status:"error", error: "Usuario ya existe"})
const newUser = {
    first_name,
    last_name,
    email,
    age,
    password,
    rol
};
users.addUser(newUser)
const token = genAndSetToken(res, email, password) 
res.send({token}) 
})

app.get('/api/sessions/logout', (req, res) => {
  res.cookie('jwt', '', { maxAge: -1 });
  res.redirect('/login');
});

app.get('/', (req, res) => {
res.render('index', { root: app.get('views') });
});
app.get('/login', (req, res) => {
  res.render('login');
});
app.get('/register', (req, res) => {
res.render('register', { root: app.get('views') });
});
app.get('/home',passportCall('jwt', { session: false }), authorization('user'),(req,res) =>{
authorization('user')(req, res,async() => {      
    const prodAll = await products.get();
    res.render('userHome', { products: prodAll });
});
})

function isAuthenticated(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.status(401).json({ message: "No estás autenticado" });
  }
}

app.get('/products', passportCall('jwt'), isAuthenticated, async (req, res) => {
  const prodAll = await products.get();
  res.render('products', { products: prodAll });
});

app.get('/admin',passportCall('jwt'), authorization('user'),(req,res) =>{
authorization('user')(req, res,async() => {    
    const prodAll = await products.get();
    res.render('adminHom', { products: prodAll });
});
})

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
