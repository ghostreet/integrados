import Router from "express";
//import { Users } from '../dao/factory.js'
import UserDTO from "../dao/DTOs/user.dto.js";
import { userService } from "../repository/index.js";
import Users from "../dao/mongo/user.mongo.js"
import { uploader} from "../utils.js";

const userRouter = Router()

const usersMongo = new Users()
//obtener usuarios
userRouter.get("/", async (req, res) => {
    req.logger.info('Se cargan usuarios');
    let result = await usersMongo.get()
    res.send({ status: "success", payload: result })
})
//crear usuario
userRouter.post("/", async (req, res) => {
    let { first_name, last_name, email, age, password, rol } = req.body

    let user = new UserDTO({ first_name, last_name, email, age, password, rol })
    let result = await userService.createUser(user)
    if(result){
        req.logger.info('Se crea Usuario correctamente');
    }else{
        req.logger.error("Error al crear Usuario");
    } 
})
//actualizatr usuario
userRouter.post("/premium/:uid", async (req, res) => {
    try {
      const { rol } = req.body;
      const allowedRoles = ['premium', 'admin', 'usuario'];
      const uid = req.params.uid;

      if (!allowedRoles.includes(rol)) {
        req.logger.error('Rol no válido proporcionado');
        return res.status(400).json({ error: 'Rol no válido' });
      }

      // Verifica  si el usuario tiene los documentos requeridos
    if (!(await hasRequiredDocuments(uid))) {
      req.logger.error('El usuario no tiene los documentos requeridos para el rol premium');
      return res.status(400).json({ error: 'El usuario no tiene los documentos requeridos para el rol premium' });
    }

      let changeRol = await userService.updUserRol({uid, rol});
  
      if (changeRol) {
        req.logger.info('Se actualiza rol correctamente');
        res.status(200).json({ message: 'Rol actualizado correctamente' });
      } else {
        req.logger.error('Error al actualizar el rol');
        res.status(500).json({ error: 'Error al actualizar el rol' });
      }
    } catch (error) {
      console.error('Error en la ruta /rol/:uid:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  });

  const allFiles = [];
userRouter.post("/:uid/documents", uploader.fields([
  { name: 'profiles', maxCount: 2 },    // limite ajustable segun requerimiento
  { name: 'products', maxCount: 2 },
  { name: 'documents', maxCount: 2 },
  { name: 'identificacion', maxCount: 1 },
  { name: 'comprobante_domicilio', maxCount: 1 },
  { name: 'comprobante_estado_cuenta', maxCount: 1 }
]), async (req, res) => {
  const files = req.files;
  const userId = req.params.uid
  let user = await usersMongo.getUserById(userId)
  if (!user) {
    return res.status(404).json({ status: 'error', error: 'Usuario no encontrado' });
  }
  //verificador de documentos
  if (files['profiles']) {
    const profiles = files['profiles'].map(file => ({ name: 'profiles', path: file.path }));
    usersMongo.updateDocuments(userId, ...profiles)
    allFiles.push(...profiles);
  }
  if (files['products']) {
    const products = files['products'].map(file => ({ name: 'products', path: file.path }));
    usersMongo.updateDocuments(userId, ...products)
    allFiles.push(...products);
  }
  if (files['documents']) {
    const documentFiles = files['documents'].map(file => ({ name: 'documents', reference: file.path }));
    usersMongo.updateDocuments(userId, ...documentFiles)
    allFiles.push(...documentFiles);
  }
  if (files['identificacion']) {
    const identificacion = files['identificacion'].map(file => ({ name: 'identificacion', reference: file.path }));
    usersMongo.updateDocuments(userId, ...identificacion)
    allFiles.push(...identificacion);
  }
  if (files['comprobante_domicilio']) {
    const comprobante_domicilio = files['comprobante_domicilio'].map(file => ({ name: 'comprobante_domicilio', reference: file.path }));
    usersMongo.updateDocuments(userId, ...comprobante_domicilio)
    allFiles.push(...comprobante_domicilio);
  }
  if (files['comprobante_estado_cuenta']) {
    const comprobante_estado_cuenta = files['comprobante_estado_cuenta'].map(file => ({ name: 'comprobante_estado_cuenta', reference: file.path }));
    usersMongo.updateDocuments(userId, ...comprobante_estado_cuenta)
    allFiles.push(...comprobante_estado_cuenta);
  }
  res.status(200).json({ status: 'success', payload: allFiles });
});


export default userRouter;