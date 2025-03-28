import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';

import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('name', 'El nombre es requerido').not().isEmpty(),
  body('email', 'Por favor incluya un email válido').isEmail(),
  body('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 })
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        error: 'El usuario ya existe'
      });
    }

    // Create new user
    user = new User({
      name,
      email,
      password
    });

    // Save user to database
    await user.save();

    // Return JWT token
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

// @route   POST /api/users/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
  body('email', 'Por favor incluya un email válido').isEmail(),
  body('password', 'La contraseña es requerida').exists()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`Intento de login fallido: Usuario no encontrado para email ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Check if password matches
    console.log(`Verificando contraseña para usuario: ${email}`);
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log(`Intento de login fallido: Contraseña incorrecta para ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    console.log(`Login exitoso para usuario: ${email}`);
    
    // Return JWT token
    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

// @route   POST /api/users/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', [
  body('email', 'Por favor incluya un email válido').isEmail()
], async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h'
    });

    // Save reset token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Asegurarse de que FRONTEND_URL no termine con una barra (/)
    const baseUrl = process.env.FRONTEND_URL.endsWith('/') 
      ? process.env.FRONTEND_URL.slice(0, -1) 
      : process.env.FRONTEND_URL;

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(resetToken)}`;

    console.log('URL de restablecimiento generada:', resetUrl); // Para depuración

    // Implementar el envío de correo
    try {
      const emailServiceModule = await import('../services/emailService.js');
      const emailService = emailServiceModule.default;
      
      const result = await emailService.sendEmail({
        to: user.email,
        subject: 'Restablecimiento de contraseña',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px;">
            <h2 style="color: #333;">Recuperación de contraseña</h2>
            <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Restablecer contraseña</a>
            </div>
            <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
            <p>El enlace expirará en 1 hora.</p>
            <p>Si el botón no funciona, copia y pega esta URL en tu navegador: <br> 
              <a href="${resetUrl}">${resetUrl}</a>
            </p>
          </div>
        `
      });
      
      console.log('Resultado del envío de correo de restablecimiento:', result);
      
      if (!result.success) {
        console.error('Error al enviar correo de restablecimiento:', result.error);
        return res.status(500).json({
          success: false,
          error: 'Error al enviar el correo electrónico de restablecimiento'
        });
      }
      
    } catch (emailError) {
      console.error('Error al importar o usar el servicio de email:', emailError);
      // No detener el proceso si falla el correo
    }

    res.json({
      success: true,
      message: 'Instrucciones de restablecimiento de contraseña enviadas'
    });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

// @route   PUT /api/users/reset-password
// @desc    Reset password
// @access  Public
router.put('/reset-password', async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      success: false,
      error: 'Por favor proporcione un token y una nueva contraseña'
    });
  }

  try {
    // Verificar el token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      console.error('Error al verificar token:', error);
      return res.status(400).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    // Buscar el usuario
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    // Verificar si el token coincide con el almacenado en la base de datos (opcional)
    if (user.resetPasswordToken !== token) {
      console.log('Token no coincide:', { 
        storedToken: user.resetPasswordToken,
        receivedToken: token.substring(0, 20) + '...' 
      });
      return res.status(400).json({
        success: false,
        error: 'Token no válido para este usuario'
      });
    }

    // Verificar si el token ha expirado
    if (user.resetPasswordExpire && user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        error: 'Token expirado. Por favor solicita un nuevo restablecimiento de contraseña'
      });
    }

    // SOLUCIÓN: Hashear la contraseña manualmente en lugar de depender del middleware
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Actualizar la contraseña
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    // Deshabilitar el middleware pre-save para este caso
    const savedUser = await User.findByIdAndUpdate(
      user._id,
      { 
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined
      },
      { new: true }
    );

    console.log('Contraseña actualizada para usuario:', user.email);

    res.json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email
        }
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: 'Error en el servidor'
    });
  }
});

export default router;