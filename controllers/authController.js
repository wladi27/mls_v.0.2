const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwtConfig');

// Función para registrar un nuevo usuario
exports.registrarUsuario = async (req, res) => {
  const {
    nombre_completo,
    linea_llamadas,
    linea_whatsapp,
    cuenta_numero,
    banco,
    titular_cuenta,
    correo_electronico,
    dni,
    nombre_usuario,
    contraseña,
    codigo_referido // Nuevo campo
  } = req.body;

  try {
    // Validar que todos los campos requeridos estén presentes
    if (!nombre_completo || !nombre_usuario || !contraseña || !correo_electronico || !dni) {
      return res.status(400).json({ message: 'Faltan campos requeridos' });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ nombre_usuario });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El nombre de usuario ya está en uso' });
    }

    // Verificar si el correo electrónico ya está en uso
    const correoExistente = await Usuario.findOne({ correo_electronico });
    if (correoExistente) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
    }

    // Obtener todos los usuarios existentes para determinar el nivel
    const usuarios = await Usuario.find();
    const niveles = {};

    usuarios.forEach(usuario => {
      if (!niveles[usuario.nivel]) {
        niveles[usuario.nivel] = 0;
      }
      niveles[usuario.nivel]++;
    });

    // Determinar el siguiente nivel
    let nivelUsuario = 0;
    while (true) {
      const maxUsuariosEnNivel = 3 ** nivelUsuario; // 3^n usuarios en el nivel n
      if ((niveles[nivelUsuario] || 0) < maxUsuariosEnNivel) {
        break;
      }
      nivelUsuario++;
    }

    const nuevoUsuario = new Usuario({
      nombre_completo,
      linea_llamadas,
      linea_whatsapp,
      cuenta_numero,
      banco,
      titular_cuenta,
      correo_electronico,
      nivel: nivelUsuario, // Asignar el nivel calculado
      dni,
      nombre_usuario,
      contraseña, // La contraseña se encriptará automáticamente
      codigo_referido // Guardar el código de referido si lo tiene
    });

    await nuevoUsuario.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente', usuario: nuevoUsuario });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Función para autenticar un usuario
exports.autenticarUsuario = async (req, res) => {
  const { nombre_usuario, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ nombre_usuario });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const esValido = await usuario.matchPassword(contraseña);
    if (!esValido) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, usuario });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función para obtener un usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(usuario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función para actualizar un usuario
exports.actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre_completo, linea_llamadas, linea_whatsapp, cuenta_numero, banco, titular_cuenta, correo_electronico, dni, nombre_usuario } = req.body;

  try {
    const usuario = await Usuario.findByIdAndUpdate(id, {
      nombre_completo,
      linea_llamadas,
      linea_whatsapp,
      cuenta_numero,
      banco,
      titular_cuenta,
      correo_electronico,
      dni,
      nombre_usuario
    }, { new: true });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario actualizado exitosamente', usuario });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Función para eliminar un usuario
exports.eliminarUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByIdAndDelete(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
