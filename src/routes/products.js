const express = require('express');
const router = express.Router();
const { products } = require('../mocks/data');

// Listar todos os produtos
router.get('/', async (req, res) => {
    try {
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar produtos por categoria
router.get('/category/:categoryId', async (req, res) => {
    try {
        const categoryProducts = products.filter(p => p.categoryId === parseInt(req.params.categoryId));
        res.json(categoryProducts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Buscar produtos por nome ou descrição
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Termo de busca não fornecido' });
        }
        
        const searchResults = products.filter(p => 
            p.name.toLowerCase().includes(q.toLowerCase()) || 
            p.description.toLowerCase().includes(q.toLowerCase())
        );
        
        res.json(searchResults);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obter um produto específico
router.get('/:id', async (req, res) => {
    try {
        const product = products.find(p => p.id === parseInt(req.params.id));
        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Criar um novo produto
router.post('/', async (req, res) => {
    try {
        const newProduct = {
            id: products.length + 1,
            ...req.body,
            createdAt: new Date()
        };
        products.push(newProduct);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atualizar um produto
router.put('/:id', async (req, res) => {
    try {
        const index = products.findIndex(p => p.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        
        products[index] = { ...products[index], ...req.body };
        res.json(products[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atualizar apenas o estoque de um produto
router.patch('/:id/stock', async (req, res) => {
    try {
        const { stock } = req.body;
        const index = products.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        
        products[index].stock = stock;
        res.json(products[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deletar um produto
router.delete('/:id', async (req, res) => {
    try {
        const index = products.findIndex(p => p.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        
        products.splice(index, 1);
        res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 