// user.routes.js
import express from 'express';
import userController from '../controllers/user.controller.js';

const UserRouter = express.Router();

userRouter.get("/register", userController.getRegisterPage);
userRouter.post("/register", userController.registerUser);
userRouter.post("/login", userController.loginUser);
userRouter.get("/logout", userController.logoutUser);


export default UserRouter;