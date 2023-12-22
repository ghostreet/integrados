// user.routes.js
import express from 'express';
import userController from '../controllers/user.controller.js';

const UserRouter = express.Router();

UserRouter.get("/register", userController.getRegisterPage);
UserRouter.post("/register", userController.registerUser);
UserRouter.post("/login", userController.loginUser);
UserRouter.get("/logout", userController.logoutUser);



export default UserRouter;