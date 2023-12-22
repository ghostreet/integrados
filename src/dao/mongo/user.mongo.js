import usersModel from './models/user.model.js'

export default class Users {
    constructor() {

    }

    get = async () => {
        try
        {
            let users = await usersModel.find()
            return users
        }catch (error) {
            console.error('Error al obtener usuarios:', error);
            return 'Error obtener usuarios';
        }       
    }
    getUserById = async (id) => { 
        try 
        {
          const user = await usersModel.findById(id).lean();    
          if (!user) 
          {
            return 'Usuario no encontrado';
          }   
          return user;
        } catch (error) {
          console.error('Error al obtener el usuario:', error);
          return 'Error al obtener el usuario';
        }
      }
      getUserByEmail = async (email) => {
        try {
          const user = await usersModel.findOne({ email: email }).lean();
          
          if (user) {
            return user;
          } else {
            return null; 
          }
        } catch (error) {
          console.error('Error al obtener el usuario:', error);
          return 'Error al obtener el usuario';
        }
     };
    findEmail = async (param) => {
        try
        {
            const user = await usersModel.findOne(param)  
            return user
        }catch (error) {
            console.error('Email no encontrado:', error);
            return 'Email de usuario no encontrado';
        }   
        
    }
    addUser = async (userData) => {
        try
        {
            let userCreate = await usersModel.create(userData);
            console.log("Usuario creado correctamente")
            return userCreate
        }catch(error){
            console.error('Error al crear usuario:', error);
            return 'Error al crear usuario';
        }      
    }
    getUserRoleByEmail = async (email) => {
      try {
        
        const user = await usersModel.findOne({ email });
    
        // Verifica si se encontró un usuario con rol admin
        if (user && user.rol === 'admin') {
          return 'admin'
        } else {
          return "usuario con otro rol"
        }""
      } catch (error) {
        console.error('Error al obtener el rol del usuario:', error);
        return 'Error al obtener el rol del usuario';
      }
    };
    updatePassword = async (email, newPassword) => {
      try {
          const updatedUser = await usersModel.findOneAndUpdate(
              { email: email },
              { $set: { password: newPassword } },
              { new: true } 
          );
  
          if (updatedUser) {
              return updatedUser;
          } else {
              console.error('Usuario no encontrado');
          }
      } catch (error) {
          console.error('Error al actualizar la contraseña:', error);
          return 'Error al actualizar la contraseña';
      }
  };
    findJWT = async (filterFunction) => {
        try
        {
            const user = await usersModel.find(filterFunction)
            return user
        }catch(error){
            console.error('Error al obtener filtro JWT:', error);
            return 'Error al obtener filtro JWT';
        }      
    }
    getPasswordByEmail = async (email) => {
        try {
          const user = await usersModel.findOne({ email: email }).lean();
      
          if (user) {
            const pass = user.password;
            return pass; 
          } else {
            return null; 
          }
        } catch (error) {
          console.error('Error al obtener el usuario:', error);
          return 'Error al obtener el usuario';
        }
      };
      updateUserRoleById = async ({uid, rol}) => {
        try {
          const updatedUser = await usersModel.findByIdAndUpdate(
            uid,
            { $set: { rol: rol } },
            { new: true }
          );
      
          if (updatedUser) {
            return updatedUser;
          } else {
            console.error('Usuario no encontrado');
            throw new Error ('No se ha podido asignar el Rol')
            
          }
        } catch (error) {
          console.error('Error al actualizar el rol:', error);
          return 'Error al actualizar el rol';
        }
      };
}