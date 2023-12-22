import UserModel from '../dao/mongo/user.mongo.js';

const userManager = new UserModel();

const userController = {
  getRegisterPage: (req, res) => {
    try {
      res.redirect("/register");
    } catch (error) {
      res.status(500).send('Error al acceder al perfil: ' + error.message);
    }
  },

  registerUser: (req, res) => {
    try {
      const newUser = req.body;
      userManager.addUser(newUser);
      res.redirect("/login");
    } catch (error) {
      res.status(500).send('Error al registrar usuario: ' + error.message);
    }
  },

  loginUser: async (req, res) => {
    try {
      const email = req.body.email;
      const data = await userManager.validateUser(email);

      if (data && data.password === req.body.password) {
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
        res.redirect("../../login");
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