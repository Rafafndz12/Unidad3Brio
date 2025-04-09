const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define(
    'users',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    },
    {
        hooks: {
            beforeCreate: async (user) => {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            },
            beforeUpdate: async (user) => {
                if (user.changed('password')) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            }
        }
    }
);

/**
 * Método seguro para crear un usuario con transacción.
 */
User.createUserWithTransaction = async function (name, email, password) {
    const transaction = await sequelize.transaction();

    try {
        // Hash de la contraseña antes de guardar
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear usuario dentro de la transacción
        const user = await User.create(
            { name, email, password: hashedPassword },
            { transaction }
        );

        await transaction.commit(); // Confirmar transacción
        return user;
    } catch (error) {
        await transaction.rollback(); // Revertir si hay error
        throw error;
    }
};

/**
 * Método seguro para actualizar la contraseña con bloqueo y transacción.
 */
User.updatePasswordWithTransaction = async function (userId, newPassword) {
    const transaction = await sequelize.transaction();

    try {
        // Bloqueo de dos fases: Obtener usuario con bloqueo para evitar condiciones de carrera
        const user = await User.findOne({
            where: { id: userId },
            lock: transaction.LOCK.UPDATE, // Bloquea el usuario hasta que finalice la transacción
            transaction
        });

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        // Hash de la nueva contraseña
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Guardar cambios dentro de la transacción
        await user.save({ transaction });

        await transaction.commit(); // Confirmar transacción
        return user;
    } catch (error) {
        await transaction.rollback(); // Revertir cambios en caso de error
        throw error;
    }
};

module.exports = User;
