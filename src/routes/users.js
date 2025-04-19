const express = require('express');
const router = express.Router();
const { users, orders } = require('../mocks/data');

// Listar todos os usuários
router.get('/', async (req, res) => {
    try {
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Obter um usuário específico
router.get('/:id', async (req, res) => {
    try {
        const user = users.find(u => u.id === parseInt(req.params.id));
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Criar um novo usuário
router.post('/', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        // Verificar se o email já existe
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }
        
        const newUser = {
            id: users.length + 1,
            name,
            email,
            password,
            role: role || 'user',
            createdAt: new Date()
        };
        
        users.push(newUser);
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atualizar um usuário
router.put('/:id', async (req, res) => {
    try {
        const index = users.findIndex(u => u.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        users[index] = { ...users[index], ...req.body };
        res.json(users[index]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Atualizar senha do usuário
router.patch('/:id/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const index = users.findIndex(u => u.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        if (users[index].password !== currentPassword) {
            return res.status(400).json({ message: 'Senha atual incorreta' });
        }
        
        users[index].password = newPassword;
        res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar pedidos do usuário
router.get('/:id/orders', async (req, res) => {
    try {
        const userOrders = orders.filter(o => o.userId === parseInt(req.params.id));
        res.json(userOrders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Deletar um usuário
router.delete('/:id', async (req, res) => {
    try {
        const index = users.findIndex(u => u.id === parseInt(req.params.id));
        if (index === -1) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }
        
        users.splice(index, 1);
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 