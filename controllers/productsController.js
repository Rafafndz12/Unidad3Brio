const Product = require('../models/products');
const sequelize = require('../config/db');

// Crear un nuevo producto con transacción
exports.create = async (req, res) => {
    const { name, stock, price } = req.body;
    const transaction = await sequelize.transaction();

    try {
        const product = await Product.create({ name, stock, price }, { transaction });
        await transaction.commit();
        res.status(201).json({ success: true, data: product });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, error: error.message });
    }
};

// Obtener todos los productos (sin cambios)
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Obtener un producto por ID (sin cambios)
exports.getProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findByPk(id);
        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Actualizar un producto con bloqueo de dos fases
exports.update = async (req, res) => {
    const { id } = req.params;
    const { name, stock, price } = req.body;
    const transaction = await sequelize.transaction();

    try {
        // Bloqueo de dos fases: Obtener producto con LOCK.UPDATE
        const product = await Product.findOne({
            where: { id },
            lock: transaction.LOCK.UPDATE,
            transaction
        });

        if (!product) {
            await transaction.rollback();
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        product.name = name;
        product.stock = stock;
        product.price = price;

        await product.save({ transaction });
        await transaction.commit();
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, error: error.message });
    }
};

// Eliminar un producto con bloqueo de dos fases
exports.delete = async (req, res) => {
    const { id } = req.params;
    const transaction = await sequelize.transaction();

    try {
        // Bloquear el producto antes de eliminarlo
        const product = await Product.findOne({
            where: { id },
            lock: transaction.LOCK.UPDATE,
            transaction
        });

        if (!product) {
            await transaction.rollback();
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        await product.destroy({ transaction });
        await transaction.commit();
        res.status(204).json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, error: error.message });
    }
};
