const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Product = require('./products');

const Purchase = sequelize.define('Purchase', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        references: {
            model: Product,
            key: 'id'
        },
        allowNull: false
    }
});

// Definir relación con el modelo Product
Purchase.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });

/**
 * Método para realizar una compra con transacción y bloqueo de dos fases.
 */
Purchase.createPurchaseWithTransaction = async function (userId, productId, quantity) {
    const transaction = await sequelize.transaction(); // Iniciar transacción

    try {
        // Llamar al método de Product para reducir stock con bloqueo
        const product = await Product.decrementStock(productId, quantity, transaction);

        // Calcular total
        const totalPrice = product.price * quantity;

        // Crear la compra
        const purchase = await Purchase.create({
            productId,
            quantity,
            total: totalPrice
        }, { transaction });

        await transaction.commit(); // Confirmar transacción
        return purchase;
    } catch (error) {
        await transaction.rollback(); // Revertir cambios en caso de error
        throw error;
    }
};

module.exports = Purchase;
