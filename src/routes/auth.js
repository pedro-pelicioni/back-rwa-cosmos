const express = require('express');
const router = express.Router();
const { users } = require('../mocks/data');

// Rota de login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            return res.status(401).json({ message: 'Email ou senha inválidos' });
        }

        // Em um ambiente real, aqui geraríamos um JWT
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token: 'mock-jwt-token'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota de registro
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Verificar se o email já existe
        if (users.find(u => u.email === email)) {
            return res.status(400).json({ message: 'Email já cadastrado' });
        }

        const newUser = {
            id: users.length + 1,
            name,
            email,
            password,
            role: 'user',
            createdAt: new Date()
        };

        users.push(newUser);

        res.status(201).json({
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para obter dados do usuário logado
router.get('/me', async (req, res) => {
    try {
        // Em um ambiente real, aqui validaríamos o token
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'Token não fornecido' });
        }
        
        // Simulando um usuário logado
        const user = users[0];
        
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota de logout
router.post('/logout', async (req, res) => {
    try {
        // Em um ambiente real, aqui invalidaríamos o token
        res.json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rota para renovar o token
router.post('/refresh-token', async (req, res) => {
    try {
        // Em um ambiente real, aqui validaríamos o refresh token
        res.json({
            token: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 