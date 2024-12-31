const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
  nombre_completo: { type: String, required: true },
  linea_llamadas: { type: String },
  linea_whatsapp: { type: String },
  cuenta_numero: { type: String },
  banco: { type: String },
  titular_cuenta: { type: String },
  correo_electronico: { type: String, required: true, unique: true },
  nivel: { type: Number, default: 0 },
  dni: { type: String, required: true, unique: true },
  nombre_usuario: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  codigo_referido: { type: String } // Campo opcional
});

// Encriptar la contraseña antes de guardar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('contraseña')) return next();
  this.contraseña = await bcrypt.hash(this.contraseña, 10);
  next();
});

// Método para comparar contraseñas
usuarioSchema.methods.matchPassword = async function (contraseña) {
  return await bcrypt.compare(contraseña, this.contraseña);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
