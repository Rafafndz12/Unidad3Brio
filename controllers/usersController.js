const { where } = require('sequelize');
const User = require('../models/users');
const sequelize = require('../config/db');

/**
 * Crear un nuevo usuario con transacción (y encriptación automática por hooks)
 */
exports.create = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const user = await User.create(req.body, { transaction });
        await transaction.commit();

        res.status(201).json({ success: true, data: user });
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * Obtener todos los usuarios
 */
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * Obtener un usuario por ID
 */
exports.getUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * Actualizar un usuario por ID con transacción
 */
exports.update = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const user = await User.findByPk(id, { transaction });

        if (!user) {
            await transaction.rollback();
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        await user.update(req.body, { transaction });
        await transaction.commit();

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ success: false, error: error.message });
    }
};

/**
 * Eliminar un usuario por ID con transacción
 */
exports.delete = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { id } = req.params;
        const deleted = await User.destroy({ where: { id }, transaction });

        if (!deleted) {
            await transaction.rollback();
            return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        await transaction.commit();
        res.status(200).json({ success: true, message: 'Usuario eliminado correctamente' });
    } catch (error) {
        await transaction.rollback();
        res.status(400).json({ success: false, error: error.message });
    }
};
