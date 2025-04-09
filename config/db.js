require('dotenv').config();  // Cargar las variables de entorno al inicio
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    'unidad3', // Nombre de la base de datos
    'fer',     // Usuario
    'base',    // Contraseña
    {
        host: '127.0.0.1',
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);
// ✅ Verificar conexión a la base de datos
sequelize.authenticate()
    .then(() => console.log('✅ Conexión a la base de datos establecida correctamente'))
    .catch(err => console.error('❌ Error al conectar a la base de datos:', err));

module.exports = sequelize;
