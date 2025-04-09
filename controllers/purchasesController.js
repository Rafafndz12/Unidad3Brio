const Purchase = require('../models/purchase');

/**
 * Crear una nueva compra de producto con transacción y bloqueo de dos fases.
 */
exports.buyProduct = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        // Aquí podrías agregar un userId si manejas usuarios autenticados
        // const userId = req.user.id;

        // Realiza la compra usando el método seguro del modelo
        const purchase = await Purchase.createPurchaseWithTransaction(null, productId, quantity);

        res.status(201).json({
            success: true,
            message: 'Compra realizada exitosamente',
            data: purchase
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al realizar la compra',
            error: error.message
        });
    }
};

/**
 * Obtener todas las compras registradas.
 */
exports.getPurchases = async (req, res) => {
    try {
        const purchases = await Purchase.findAll();
        res.status(200).json({
            success: true,
            data: purchases
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las compras',
            error: error.message
        });
    }
};

/**
 * Obtener una compra específica por ID.
 */
exports.getPurchaseById = async (req, res) => {
    const { id } = req.params;

    try {
        const purchase = await Purchase.findByPk(id);
        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Compra no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            data: purchase
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener la compra',
            error: error.message
        });
    }
};

/**
 * Eliminar una compra por ID.
 */
exports.deletePurchase = async (req, res) => {
    const { id } = req.params;

    try {
        const purchase = await Purchase.findByPk(id);
        if (!purchase) {
            return res.status(404).json({
                success: false,
                message: 'Compra no encontrada'
            });
        }

        await purchase.destroy();
        res.status(200).json({
            success: true,
            message: 'Compra eliminada correctamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la compra',
            error: error.message
        });
    }
};
