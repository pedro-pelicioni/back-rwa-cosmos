const RWA = require('../models/RWA');

// Função para converter snake_case para camelCase
function snakeToCamel(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

// Função para converter objeto de snake_case para camelCase
function convertToCamelCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => convertToCamelCase(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const camelKey = snakeToCamel(key);
                newObj[camelKey] = convertToCamelCase(obj[key]);
            }
        }
        return newObj;
    }
    
    return obj;
}

// Função para converter camelCase para snake_case
function camelToSnake(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

// Função para converter objeto de camelCase para snake_case
function convertToSnakeCase(obj) {
    if (Array.isArray(obj)) {
        return obj.map(item => convertToSnakeCase(item));
    }
    
    if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const snakeKey = camelToSnake(key);
                newObj[snakeKey] = convertToSnakeCase(obj[key]);
            }
        }
        return newObj;
    }
    
    return obj;
}

class RWAController {
    static async create(req, res) {
        try {
            const rwaData = req.body;
            
            // Validar campos obrigatórios
            const requiredFields = ['name', 'location', 'city', 'country', 'currentValue', 'totalTokens'];
            const missingFields = requiredFields.filter(field => !rwaData[field]);
            
            if (missingFields.length > 0) {
                return res.status(400).json({
                    error: 'Campos obrigatórios faltando',
                    fields: missingFields
                });
            }

            // Garantir que os campos numéricos sejam números
            rwaData.currentValue = Number(rwaData.currentValue);
            rwaData.totalTokens = Number(rwaData.totalTokens);
            rwaData.userId = req.user.id; // Usar o ID do usuário do token JWT

            // Validar valores numéricos
            if (rwaData.currentValue < 0) {
                return res.status(400).json({ error: 'currentValue deve ser maior ou igual a zero' });
            }

            if (rwaData.totalTokens < 1) {
                return res.status(400).json({ error: 'totalTokens deve ser maior que zero' });
            }

            // Converter para snake_case antes de enviar para o modelo
            const snakeCaseData = convertToSnakeCase(rwaData);
            const rwa = await RWA.create(snakeCaseData);
            
            // Converter de volta para camelCase antes de enviar para o frontend
            const camelCaseRwa = convertToCamelCase(rwa);
            
            res.status(201).json(camelCaseRwa);
        } catch (error) {
            console.error('Erro ao criar RWA:', error);
            res.status(500).json({ error: error.message });
        }
    }

    static async getById(req, res) {
        try {
            const rwa = await RWA.findById(req.params.id);
            if (!rwa) {
                return res.status(404).json({ error: 'RWA não encontrado' });
            }
            
            // Converter para camelCase antes de enviar para o frontend
            const camelCaseRwa = convertToCamelCase(rwa);
            
            // Garantir que os campos numéricos estejam presentes
            if (!camelCaseRwa.currentValue) camelCaseRwa.currentValue = 0;
            if (!camelCaseRwa.totalTokens) camelCaseRwa.totalTokens = 1;
            if (!camelCaseRwa.userId) camelCaseRwa.userId = 0;
            
            res.json(camelCaseRwa);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getUserRWAs(req, res) {
        try {
            const userId = Number(req.params.userId);
            if (isNaN(userId) || userId <= 0) {
                return res.status(400).json({ error: 'userId inválido' });
            }

            const rwas = await RWA.findByUserId(userId);
            
            // Converter para camelCase antes de enviar para o frontend
            const camelCaseRwas = convertToCamelCase(rwas);
            
            // Garantir que os campos numéricos estejam presentes
            camelCaseRwas.forEach(rwa => {
                if (!rwa.currentValue) rwa.currentValue = 0;
                if (!rwa.totalTokens) rwa.totalTokens = 1;
                if (!rwa.userId) rwa.userId = 0;
            });
            
            res.json(camelCaseRwas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async update(req, res) {
        try {
            const { id } = req.params;
            const rwaData = req.body;

            // Validar campos numéricos se fornecidos
            if (rwaData.currentValue !== undefined) {
                rwaData.currentValue = Number(rwaData.currentValue);
                if (rwaData.currentValue < 0) {
                    return res.status(400).json({ error: 'currentValue deve ser maior ou igual a zero' });
                }
            }

            if (rwaData.totalTokens !== undefined) {
                rwaData.totalTokens = Number(rwaData.totalTokens);
                if (rwaData.totalTokens < 1) {
                    return res.status(400).json({ error: 'totalTokens deve ser maior que zero' });
                }
            }

            if (rwaData.userId !== undefined) {
                rwaData.userId = Number(rwaData.userId);
                if (rwaData.userId <= 0) {
                    return res.status(400).json({ error: 'userId deve ser maior que zero' });
                }
            }
            
            // Converter para snake_case antes de enviar para o modelo
            const snakeCaseData = convertToSnakeCase(rwaData);
            const rwa = await RWA.update(id, snakeCaseData);
            
            if (!rwa) {
                return res.status(404).json({ error: 'RWA não encontrado' });
            }
            
            // Converter para camelCase antes de enviar para o frontend
            const camelCaseRwa = convertToCamelCase(rwa);
            
            // Garantir que os campos numéricos estejam presentes
            if (!camelCaseRwa.currentValue) camelCaseRwa.currentValue = 0;
            if (!camelCaseRwa.totalTokens) camelCaseRwa.totalTokens = 1;
            if (!camelCaseRwa.userId) camelCaseRwa.userId = 0;
            
            res.json(camelCaseRwa);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async delete(req, res) {
        try {
            const { id } = req.params;
            const result = await RWA.delete(id);
            
            if (!result) {
                return res.status(404).json({ error: 'RWA não encontrado' });
            }
            
            res.json({ message: 'RWA deletado com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async listAll(req, res) {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;
            const rwas = await RWA.listAll(filters, parseInt(page), parseInt(limit));
            
            // Converter para camelCase antes de enviar para o frontend
            const camelCaseRwas = convertToCamelCase(rwas);
            
            // Garantir que os campos numéricos estejam presentes
            camelCaseRwas.forEach(rwa => {
                if (!rwa.currentValue) rwa.currentValue = 0;
                if (!rwa.totalTokens) rwa.totalTokens = 1;
                if (!rwa.userId) rwa.userId = 0;
            });
            
            res.json(camelCaseRwas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async findByProximity(req, res) {
        try {
            const { latitude, longitude, radius } = req.query;
            
            if (!latitude || !longitude) {
                return res.status(400).json({ error: 'Latitude e longitude são obrigatórios' });
            }

            const rwas = await RWA.findByProximity(
                parseFloat(latitude),
                parseFloat(longitude),
                radius ? parseFloat(radius) : undefined
            );
            
            // Converter para camelCase antes de enviar para o frontend
            const camelCaseRwas = convertToCamelCase(rwas);
            
            // Garantir que os campos numéricos estejam presentes
            camelCaseRwas.forEach(rwa => {
                if (!rwa.currentValue) rwa.currentValue = 0;
                if (!rwa.totalTokens) rwa.totalTokens = 1;
                if (!rwa.userId) rwa.userId = 0;
            });
            
            res.json(camelCaseRwas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getTokensByOwner(req, res) {
        try {
            const { userId } = req.params;
            const tokens = await RWA.findTokensByOwner(userId);
            
            if (!tokens) {
                return res.status(404).json({ error: 'Nenhum token encontrado para este usuário' });
            }
            
            res.json(convertToCamelCase(tokens));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getUserData(req, res) {
        try {
            const { userId } = req.params;
            const user = await RWA.findUserById(userId);
            
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            
            res.json(convertToCamelCase(user));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = RWAController; 