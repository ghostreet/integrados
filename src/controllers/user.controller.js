import UserManager from '../dao/servicios/UserManager.js';
import bcrypt from 'bcrypt';


const userManager = new UserManager();

const userController = {
  getRegisterPage: (req, res) => {
    try {
      res.redirect("/register");
    } catch (error) {
      res.status(500).send('Error al acceder al perfil: ' + error.message);
    }
  },

  registerUser: async (req, res) => {
    try {
      const newUser = req.body;
      newUser.password = bcrypt.hashSync(newUser.password, 10);
      await userManager.addUser(newUser);
      res.redirect("/login");
    } catch (error) {
      res.status(500).send('Error al registrar usuario: ' + error.message);
    }
  },

  loginUser: async (req, res) => {
    try {
      const email = req.body.email;
      const data = await userManager.validateUser(email);
  
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        req.session.emailUser = email;
        req.session.namUser = data.first_name;
        req.session.lasNamUser = data.last_name;
        req.session.rolUser = data.rol;
  
        if (data.rol === 'admin') {
          res.redirect("/profile");
        } else {
          res.redirect("/products");
        }
      } else {
        res.redirect("../../login?error=Invalid email or password");
      }
    } catch (error) {
      res.status(500).send('Error al acceder al perfil: ' + error.message);
    }
  },

  logoutUser: async (req, res) => {
    req.session.destroy((error) => {
      if (error) {
        return res.json({ status: "Logout Error", body: error });
      }
      res.redirect('../../login');
    });
  },
};

export default userController;