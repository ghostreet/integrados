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
import Carts from './dao/mongo/carts.mongo.js'
import Tickets from './dao/mongo/tickets.mongo.js'

import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';

import __dirname, { authorization, passportCall, transport } from "./utils.js"
import initializePassport from "./config/passport.config.js"
import * as path from "path"

import {genAndSetToken, genAndSetTokenEmail, 
  validateTokenResetPass, getEmailFromToken, getEmailFromTokenLogin} from "./jwt/token.js"
  
import UserDTO from './dao/DTOs/user.dto.js'
import {Server} from "socket.io"
import { engine } from "express-handlebars";
import compression from 'express-compression'
import { nanoid } from 'nanoid'
import loggerMiddleware from "./loggerMiddleware.js";

import swaggerJSDoc from 'swagger-jsdoc'
import swaggerUIExpress from 'swagger-ui-express'
import bodyParser from 'body-parser'

const app= express();
const PORT = 8080;

const users = new UserMongo()
const products = new ProdMongo()
const carts = new Carts()
const tickets = new Tickets()

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

import MongoStore from "connect-mongo";
import session from "express-session";



app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.engine('hbs', engine({ allowProtoPropertiesByDefault: true, extname: '.hbs' }));
app.set("view engine", "hbs");
app.set('views', path.join(__dirname, 'views'));
app.use(cookieParser());
app.use(compression);
initializePassport();
app.use(passport.initialize());
app.use(loggerMiddleware);


const httpServer = app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`)
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

//-Prueba conexión-//
socketServer.on("connection", socket => {
    console.log("Socket Conectado")
//-Recibir información del cliente-//
    socket.on("message", data => {
        console.log(data)
    })


socket.on("newProd", async (newProduct) => {
  let validUserPremium = await users.getUserRoleByEmail(newProduct.owner)
  if(validUserPremium == 'premium'){
      products.addProduct(newProduct)
      socketServer.emit("success", "Producto Agregado Correctamente");
  }else{
      socketServer.emit("errorUserPremium", "Producto no fue agregado owner no es usuario premium");
  }
socket.on("updProd", ({id, newProduct}) => {
    products.updateProduct(id, newProduct)
    socketServer.emit("success", "Producto Actualizado Correctamente");
});
socket.on("delProd", async (id) => {
  let ownerProd = await products.getProductOwnerById(id.id)
  const ownerResult = ownerProd.owner;
  let validUserPremium = await users.getUserRoleByEmail(ownerResult)
  if(validUserPremium == 'premium'){
      transport.sendMail({
          from: `Correo Informativo para <${ownerProd}>`,
          to:ownerResult,
          subject:'Información Eliminación Producto',
          html:`Se elimina producto con id ${id.id} correctamente`,
          attachments:[]
      })
      await products.deleteProduct(id)
      socketServer.emit("success", "Producto Eliminado Correctamente");
  }else{
      await products.deleteProduct(id)
      socketServer.emit("success", "Producto Eliminado Correctamente");
  }     
});

socket.on("delProdPremium", ({id, owner, email}) => {
  if(owner == email){
      products.deleteProduct(id)
      socketServer.emit("success", "Producto Eliminado Correctamente");
  }else{
      socketServer.emit("errorDelPremium", "Error al eliminar el producto porque no pertenece a usuario Premium");
  }  
});

socket.on("newProdInCart", async ({idProd, quantity,email}) => {
  let idCart = await users.getIdCartByEmailUser(email)
  carts.addCart(idCart, idProd, quantity)
  socketServer.emit("success", "Producto Agregado Correctamente");
});

socket.on("delUser", (id) => {
  users.deleteUser(id)
  socketServer.emit("success", "Usuario Eliminado Correctamente");
});

socket.on("updRolUser", ({id, newRol}) => {
  users.updateUserRoleById({uid: id, rol: newRol})
  socketServer.emit("success", "Usuario Actualizado Correctamente");
});

socket.on("notMatchPass", () => {
  socketServer.emit("warning", "Las contraseñas son distintas, reintente");
});
socket.on("validActualPass", async({password1, password2, email}) => {
  const emailToFind = email;
  const user = await users.findEmail({ email: emailToFind });
  const passActual = users.getPasswordByEmail(emailToFind)
  const validSamePass = isValidPassword(user, password1)

  if(validSamePass){
      socketServer.emit("samePass","No se puede ingresar la última contraseña valida, reintente");
  }else{
      const hashedPassword = await createHash(password1);
      const updatePassword = await users.updatePassword(email,hashedPassword)
      if(updatePassword)
      {
          socketServer.emit("passChange","La contraseña fue cambiada correctamente");    
      }
      else
      {
          socketServer.emit("errorPassChange","Error al cambiar la contraseña");   
      }
  }        
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
//-Enviar información al cliente-//
socket.emit("test","mensaje desde servidor a cliente, se valida en consola de navegador")

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

if (!user) {
  req.logger.error("Error de autenticación: Usuario no encontrado");
  return res.status(401).json({ message: "Error de autenticación" });
}
//compara contraseñas
try {
  const passwordMatch = isValidPassword(user, password);

  if (!passwordMatch) {
      req.logger.error("Error de autenticación: Contraseña incorrecta");
      return res.status(401).json({ message: "Error de autenticación" });
  }

   // Si la contraseña coincide, puedes continuar
   const token = genAndSetToken(res, email, password);  // Aquí se encripta la contraseña antes de usarla
   const userDTO = new UserDTO(user);
   const prodAll = await products.get();
   users.updateLastConnection(email) //Se actualiza ultima conexión de user cada vez que se inicia sesion
   res.json({ token, user: userDTO, prodAll });

   // Log de éxito
   req.logger.info("Inicio de sesión exitoso para el usuario: " + emailToFind);
} catch (error) {
   // Manejo de errores relacionados con bcrypt
   req.logger.error("Error al comparar contraseñas: " + error.message);
   console.error("Error al comparar contraseñas:", error);
   return res.status(500).json({ message: "Error interno del servidor" });
}
});

app.post("/api/register", async(req,res)=>{
const {first_name, last_name, email,age, password, rol} = req.body
const emailToFind = email
const exists = await users.findEmail({ email: emailToFind })

if (exists) {
  req.logger.warn("Intento de registro con un correo electrónico ya existente: " + emailToFind);
  return res.send({ status: "error", error: "Usuario ya existe" });
}

const hashedPassword = await createHash(password);
let resultNewCart = await carts.addCart()
const newUser = {
    first_name,
    last_name,
    email,
    age,
    password: hashedPassword,
    id_cart: resultNewCart._id.toString(),
    rol
};

try {
  users.addUser(newUser);
  const token = genAndSetToken(res, email, password);
  res.send({ token });

  // Log de éxito
  req.logger.info("Registro exitoso para el usuario: " + emailToFind);
} catch (error) {
  req.logger.error("Error al intentar registrar al usuario: " + error.message);
  console.error("Error al intentar registrar al usuario:", error);
  res.status(500).json({ message: "Error interno del servidor" });
}
});

app.get('/', (req, res) => {
  req.logger.info("Se inicia página de Inicio de Login");
  res.sendFile('index', { root: app.get('views') });
});

app.get('/logout', (req, res) => {
  req.logger.info("Se Cierra Sesión");
  let email = req.query.email
  users.updateLastConnection(email)
  res.redirect('/');
});

app.get('/register', (req, res) => {
  req.logger.info("Se inicia página de Registro de Usuarios");
  res.sendFile('register', { root: app.get('views') });
});


app.get('/current',passportCall('jwt', { session: false }), authorization('user'),(req,res) =>{
  req.logger.info("Se inicia página de Usuario");
  authorization('user')(req, res,async() => { 
      const userData = {
          email: req.user.email,
      };
      const idCartUser = await users.getIdCartByEmailUser(req.user.email)
      const prodAll = await products.get();
      res.render('userHome', { products: prodAll, user: userData, cartId : idCartUser });
  });
})

app.get('/current-plus',passportCall('jwt', { session: false }), authorization('user'),(req,res) =>{
  req.logger.info("Se inicia página de Usuario Plus (Premium)");
  authorization('user')(req, res,async() => {  
      const { token} = req.query;
      const emailToken = getEmailFromTokenLogin(token) 
      const prodAll = await products.get();
      res.render('homePrem', { products: prodAll, email: emailToken });
  });
})

app.get('/admin',passportCall('jwt'), authorization('user'),(req,res) =>{
  req.logger.info("Se inicia página de Administrador");
  authorization('user')(req, res,async() => {    
      const prodAll = await products.get();
      res.render('adminHom', { products: prodAll });
  });
})



app.get('/admin/users',passportCall('jwt'), authorization('user'),(req,res) =>{
  req.logger.info("Se inicia página de Administrador Usuario");
  authorization('user')(req, res,async() => {    
      const userAll = await users.get();
      const simplifiedUserData = userAll.map(user => ({
          _id: user._id.toString(),
          first_name: user.first_name,
          email: user.email,
          rol: user.rol,
      }));
      res.render('adminUser', { users: simplifiedUserData  });
  });
})

//cambiar contraseña
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const emailToFind = email;
  const userExists = await users.findEmail({ email: emailToFind });
  if (!userExists) {
    req.logger.error("Error al reestablecer contraseña usuario "+email+" no existe")
    console.error("Error al reestablecer contraseña usuario "+email+" no existe")
    res.json("Error al reestablecer contraseña usuario "+email+" no existe" );
    return res.status(401).json({ message: "Error al reestablecer contraseña" });
  }
  // Crear y firmar el token JWT con una expiración de 1 hora
  const token = genAndSetTokenEmail(email)

  // Configurar el enlace de restablecimiento de contraseña
  const resetLink = `http://localhost:8080/reset-password?token=${token}`;

  let result = transport.sendMail({
      from:'<srpruebascoderh@gmail.com>',
      to:email,
      subject:'Restablecer contraseña',
      html:`Haz clic en el siguiente enlace para restablecer tu contraseña: <a href="${resetLink}">Restablecer contraseña</a>`,
      attachments:[]
  })
  if(result)
  {
      req.logger.info("Se envia correo para reestablecer contraseña a correo" + emailToFind);
      res.json("Correo para reestablecer contraseña fue enviado correctamente a "+email);
  }
  else
  {
      req.logger.error("Error al enviar correo para reestablecer contraseña");
      console.error("Error al intentar reestablecer contraseña");
      res.json("Error al intentar reestablecer contraseña");
  }
});
app.get('/reset-password', async (req, res) => {
  const { token} = req.query;
  const validate = validateTokenResetPass(token)
  const emailToken = getEmailFromToken(token)
  if(validate){
      res.render('resetPassword', { token , email: emailToken});
  }
  else{
      res.sendFile('index', { root: app.get('views') });
  }
});

app.get('/products', passportCall('jwt'), isAuthenticated, async (req, res) => {
  const prodAll = await products.get();
  res.render('product', { products: prodAll });
});

})

//Ver Carritos//
app.get("/carts/:cid", async (req, res) => {
  let id = req.params.cid
  let emailActive = req.query.email
  let allCarts  = await carts.getCartWithProducts(id)
  allCarts.products.forEach(producto => {
      producto.total = producto.quantity * producto.productId.price
  });
  const sumTotal = allCarts.products.reduce((total, producto) => {
      return total + (producto.total || 0);  // Asegurarse de manejar casos donde total no esté definido
  }, 0);
  res.render("viewCart", {
      title: "Vista Carro",
      carts : allCarts,
      user: emailActive,
      calculateSumTotal: products => products.reduce((total, producto) => total + (producto.total || 0), 0)
  });
})

//Ver Checkout//
app.get("/checkout", async (req, res) => {
  let cart_Id = req.query.cartId
  let purchaser = req.query.purchaser
  let totalAmount = req.query.totalPrice
  let newCart = await carts.addCart()
  let newIdCart = newCart._id.toString()
  let updateUser = await users.updateIdCartUser({email: purchaser, newIdCart})
  if(updateUser)
  {
      const newTicket = {
          code: nanoid(),
          purchase_datetime: Date(),
          amount:totalAmount,
          purchaser: purchaser,
          id_cart_ticket:cart_Id
     }
     let result = await tickets.addTicket(newTicket)
     const newTicketId = result._id.toString();
     // Redirigir al usuario a la página del ticket recién creado
     res.redirect(`/tickets/${newTicketId}`);
  }
   
})

//Ver Tickets//
app.get("/tickets/:tid", async (req, res) => {
  let id = req.params.tid
  let allTickets  = await tickets.getTicketById(id)
  res.render("viewTicket", {
      title: "Vista Ticket",
      tickets : allTickets
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
