/*import { promises as fs} from 'fs'
import { nanoid } from 'nanoid'
import { userModel } from '../mongo/models/user.model.js'

class UserManager extends userModel{
    constructor(){
        super();
    }

    async addUser(userData)
    {
        try{
            await userModel.create(userData)
            return 'Usuario agregado con éxito';
        } catch (error) {
            console.error('Error al agregar un nuevo usuario', error);
            return 'Error al agregar nuevo usuario';
        }
    }

    async updUser (id, userData){
        try{
            const user = await UserManager.findOne(id);
            if (!user)
            { return 'Usuario no encontrado'}
            user.set(userData)
            await user.save();
            return 'Usuario actualizado'
        }catch (error) {
            console.error('error al actualizar usuario')
            return 'error al actualizar el user'
        }
    }

    async getUser(){
        try{
            const users = await userModel.find({});
            return users;
        }catch (error){
            console.error ('error al obtener registro de usuario', error)
            return[];
        }
    }

    async getUserId(id){
        try{
            const user = await UserManager.findById(id).lean();
            if (!user)
            {return 'Usuario no existe'}
            return user;
        }catch (error) {
            console.error('Error al obtener el usuario', error);
            return 'usuario no encontrado'
        }
    }

    async deleteUser(id){
        try{
            const user = await UserManager.findById(id);
            if (!user)
            {return 'Usuario no encontrado'}
            await user.remove();
            return 'Usuario eliminado'
        }catch (error) {
            console.error('error al eliminar el usuario', error)
            return 'error al eliminar usuario'
        }
    }

    async validateUser(param) {
        try{
            const user = await UserManager.findOne({email: param});
            if (!user) 
            {return 'usuario no encontrado'}
            return user;
        }catch (error) {
            console.error('Error de validación, usuario no registrado', error)
            return 'error de validación'
        }
    }


}

export default UserManager*/