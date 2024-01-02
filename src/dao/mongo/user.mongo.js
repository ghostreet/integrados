import userModel from "./models/user.model.js";

export default class Users {
  constructor() {

  }

  get = async () => {
      try
      {
          let users = await userModel.find()
          return users
      }catch (error) {
          console.error('Error al obtener usuarios:', error);
          return 'Error obtener usuarios';
      }       
  }
  findEmail = async (param) => {
      try
      {
          const user = await userModel.findOne(param)  
          return user
      }catch (error) {
          console.error('Error al buscar email:', error);
          return 'Error al buscar email de usuario';
      }   
      
  }
  addUser = async (userData) => {
      try
      {
          let userCreate = await userModel.create(userData);
          return userCreate
          console.log("Usuario creado correctamente")
      }catch(error){
          console.error('Error al crear usuario:', error);
          return 'Error al crear usuario';
      }      
  }
  findJWT = async (filterFunction) => {
      try
      {
          const user = await userModel.find(filterFunction)
          return user
      }catch(error){
          console.error('Error al obtener filtro JWT:', error);
          return 'Error al obtener filtro JWT';
      }      
  }
}