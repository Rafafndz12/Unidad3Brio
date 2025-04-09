const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.DECIMAL,
        allowNull: false
    }
});

/**
 * Método seguro para reducir stock con bloqueo de dos fases.
 */
Product.decrementStock = async function (productId, quantity, transaction) {
    try {
        // Bloqueo Pessimistic Write para evitar conflictos de concurrencia
        const product = await Product.findOne({
            where: { id: productId },
            lock: transaction.LOCK.UPDATE, // Bloquea el registro hasta que la transacción finalice
            transaction
        });

        if (!product) {
            throw new Error("Producto no encontrado");
        }

        if (product.stock < quantity) {
            throw new Error("Stock insuficiente");
        }

        // Reducir stock
        product.stock -= quantity;
        await product.save({ transaction });

        return product;
    } catch (error) {
        throw error;
    }
};

module.exports = Product;
