import jwt from 'jsonwebtoken';

export function genAndSetToken(res, email, password) {
  const token = jwt.sign({ email, password, role: "user" }, "Secret-key", { expiresIn: "24h" });
  res.cookie("token", token, { httpOnly: true, maxAge: 60 * 60 * 1000 });
  return token
}
export function getEmailFromTokenLogin(token) {
  try {
    const decoded = jwt.verify(token, 'Secret-key');
    return decoded.email;
  } catch (error) {
    console.error('Error al desencriptar token:', error);
    return null;
  }
}

export function genAndSetTokenEmail(email) {
  const token = jwt.sign({ email }, 'secreto', { expiresIn: '1h' });
  return token
}
export function getEmailFromToken(token) {
  try {
    const decoded = jwt.verify(token, 'secreto');
    const email = decoded.email;
    return email;
  } catch (error) {
    throw new Error('El token no es valido')
  }
}

export function validateTokenResetPass(token) {
  try {
    const result = jwt.verify(token, 'secreto');
    return result;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      console.error('El token ha expirado');
      // Elimina el token de la base de datos
      return null; 
    } else {
      console.error('Error al verificar el token:', error);
      return false;
    }
  }
}