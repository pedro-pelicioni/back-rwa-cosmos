const RWA = require('../models/RWA');
const db = require('../database/knex');
const RWANFTToken = require('../models/RWANFTToken');

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

// Função para validar e formatar coordenadas GPS
function validateAndFormatCoordinates(coordinates) {
    if (!coordinates || coordinates === "") return null;
    
    // Se for um objeto geometry
    if (typeof coordinates === 'object' && coordinates.coordinates) {
        const [longitude, latitude] = coordinates.coordinates;
        if (isValidCoordinate(longitude, latitude)) {
            return `${longitude}, ${latitude}`;
        }
        return null;
    }
    
    // Se for uma string
    if (typeof coordinates === 'string') {
        // Verificar se é uma string de coordenadas (deve conter números e vírgula)
        if (!coordinates.match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/)) {
            return null;
        }
        
        const [coord1, coord2] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
        
        // Determinar qual é latitude e qual é longitude
        let longitude, latitude;
        if (Math.abs(coord1) <= 90 && Math.abs(coord2) > 90) {
            // Formato: latitude, longitude
            latitude = coord1;
            longitude = coord2;
        } else if (Math.abs(coord1) > 90 && Math.abs(coord2) <= 90) {
            // Formato: longitude, latitude
            longitude = coord1;
            latitude = coord2;
        } else {
            // Se não conseguir determinar, assumir que está no formato correto
            longitude = coord1;
            latitude = coord2;
        }
        
        if (isValidCoordinate(longitude, latitude)) {
            return `${longitude}, ${latitude}`;
        }
        return null;
    }
    
    return null;
}

// Função para validar se as coordenadas são válidas
function isValidCoordinate(longitude, latitude) {
    return !isNaN(longitude) && 
           !isNaN(latitude) && 
           longitude >= -180 && 
           longitude <= 180 && 
           latitude >= -90 && 
           latitude <= 90;
}

class RWAController {
    static async create(req, res) {
        try {
            console.log('=== INÍCIO DA CRIAÇÃO DE RWA ===');
            console.log('Headers recebidos:', JSON.stringify(req.headers, null, 2));
            console.log('Body recebido:', JSON.stringify(req.body, null, 2));
            console.log('Usuário autenticado:', req.user.id);
            
            const rwaData = req.body;
            
            // Remover campos que não existem na tabela
            delete rwaData.metadata;
            
            // Tratar campo price como currentValue
            if (rwaData.price !== undefined && rwaData.currentValue === undefined) {
                console.log('Convertendo campo price para currentValue');
                rwaData.currentValue = rwaData.price;
                delete rwaData.price;
            }

            // Validar e formatar coordenadas
            let validCoordinates = null;
            
            // Tentar usar geometry primeiro
            if (rwaData.geometry && rwaData.geometry.coordinates) {
                console.log('Validando coordenadas do geometry');
                validCoordinates = validateAndFormatCoordinates(rwaData.geometry);
            }
            
            // Se não tiver geometry válido, tentar gpsCoordinates
            if (!validCoordinates && rwaData.gpsCoordinates) {
                console.log('Validando coordenadas do gpsCoordinates');
                validCoordinates = validateAndFormatCoordinates(rwaData.gpsCoordinates);
            }
            
            // Se não tiver coordenadas válidas, usar location como fallback
            if (!validCoordinates && rwaData.location) {
                console.log('Usando location como fallback');
                rwaData.gpsCoordinates = rwaData.location;
                delete rwaData.location;
            } else if (!validCoordinates) {
                console.log('Erro: Coordenadas GPS inválidas');
                return res.status(400).json({ 
                    error: 'Coordenadas GPS inválidas. Por favor, forneça coordenadas no formato "longitude, latitude" ou "latitude, longitude"',
                    example: "-99.1332, 19.4326"
                });
            } else {
                rwaData.gpsCoordinates = validCoordinates;
            }

            // Atualizar geometry com as coordenadas validadas
            if (validCoordinates) {
                const [longitude, latitude] = validCoordinates.split(',').map(coord => parseFloat(coord.trim()));
                rwaData.geometry = {
                    type: 'Point',
                    coordinates: [longitude, latitude]
                };
            }
            
            // Log dos tipos de dados recebidos
            console.log('Tipos dos campos recebidos:', {
                name: typeof rwaData.name,
                gpsCoordinates: typeof rwaData.gpsCoordinates,
                city: typeof rwaData.city,
                country: typeof rwaData.country,
                currentValue: typeof rwaData.currentValue,
                totalTokens: typeof rwaData.totalTokens,
                yearBuilt: typeof rwaData.yearBuilt,
                sizeM2: typeof rwaData.sizeM2,
                status: typeof rwaData.status,
                geometry: typeof rwaData.geometry
            });
            
            // Validar campos obrigatórios
            console.log('\n=== VALIDAÇÃO DE CAMPOS ===');
            const requiredFields = {
                name: { value: rwaData.name, type: typeof rwaData.name },
                gpsCoordinates: { value: rwaData.gpsCoordinates, type: typeof rwaData.gpsCoordinates },
                city: { value: rwaData.city, type: typeof rwaData.city },
                country: { value: rwaData.country, type: typeof rwaData.country },
                currentValue: { value: rwaData.currentValue, type: typeof rwaData.currentValue },
                totalTokens: { value: rwaData.totalTokens, type: typeof rwaData.totalTokens },
                yearBuilt: { value: rwaData.yearBuilt, type: typeof rwaData.yearBuilt },
                sizeM2: { value: rwaData.sizeM2, type: typeof rwaData.sizeM2 },
                status: { value: rwaData.status, type: typeof rwaData.status },
                geometry: { value: rwaData.geometry, type: typeof rwaData.geometry }
            };

            console.log('Tipos dos campos recebidos:', requiredFields);

            // Validar cada campo
            for (const [field, data] of Object.entries(requiredFields)) {
                console.log(`Campo ${field}:`, {
                    valor: data.value,
                    tipo: data.type,
                    'éVazio': !data.value
                });
            }

            // Converter valores numéricos
            const numericValues = {
                currentValue: { valor: Number(rwaData.currentValue), tipo: typeof Number(rwaData.currentValue) },
                totalTokens: { valor: Number(rwaData.totalTokens), tipo: typeof Number(rwaData.totalTokens) },
                userId: req.user.id
            };

            console.log('Valores após conversão numérica:', {
                currentValue: { valor: numericValues.currentValue.valor, tipo: numericValues.currentValue.tipo, 'éNaN': isNaN(numericValues.currentValue.valor) },
                totalTokens: { valor: numericValues.totalTokens.valor, tipo: numericValues.totalTokens.tipo, 'éNaN': isNaN(numericValues.totalTokens.valor) },
                userId: numericValues.userId
            });

            // Validar valores numéricos
            if (isNaN(numericValues.currentValue.valor) || numericValues.currentValue.valor < 0) {
                console.log('Erro: currentValue inválido:', numericValues.currentValue.valor);
                return res.status(400).json({ 
                    error: 'currentValue deve ser um número maior ou igual a zero',
                    receivedValue: numericValues.currentValue.valor
                });
            }

            if (isNaN(numericValues.totalTokens.valor) || numericValues.totalTokens.valor < 1) {
                console.log('Erro: totalTokens inválido:', numericValues.totalTokens.valor);
                return res.status(400).json({ 
                    error: 'totalTokens deve ser um número maior que zero',
                    receivedValue: numericValues.totalTokens.valor
                });
            }

            // Preparar dados para inserção
            const rwaDataToInsert = {
                name: req.body.name,
                description: req.body.description,
                city: req.body.city,
                country: req.body.country,
                current_value: numericValues.currentValue.valor,
                total_tokens: numericValues.totalTokens.valor,
                year_built: req.body.yearBuilt || null,
                size_m2: req.body.sizeM2 || null,
                gps_coordinates: req.body.gpsCoordinates, // Usar as coordenadas reais
                status: req.body.status,
                geometry: req.body.geometry || {},
                user_id: numericValues.userId
            };

            console.log('Dados convertidos para snake_case:', rwaDataToInsert);
            
            // Criar o RWA
            const rwa = await RWA.create(rwaDataToInsert);
            console.log('RWA criado com sucesso:', JSON.stringify(rwa, null, 2));

            // Criar os tokens NFT em lotes
            console.log(`Iniciando criação de ${numericValues.totalTokens.valor} tokens NFT para o RWA ${rwa.id}`);
            const tokens = await RWA.createTokensInBatches(rwa.id, numericValues.userId, numericValues.totalTokens.valor);
            console.log(`${tokens.length} tokens NFT criados com sucesso para o RWA ${rwa.id}`);
            
            // Converter de volta para camelCase antes de enviar para o frontend
            const camelCaseRwa = convertToCamelCase(rwa);
            camelCaseRwa.tokens = tokens.map(token => convertToCamelCase(token));
            
            console.log('=== RWA CRIADO COM SUCESSO ===');
            res.status(201).json(camelCaseRwa);
        } catch (error) {
            console.error('=== ERRO AO CRIAR RWA ===');
            console.error('Erro:', error);
            console.error('Stack trace:', error.stack);
            console.error('Dados que causaram o erro:', JSON.stringify(req.body, null, 2));
            res.status(500).json({ 
                error: error.message,
                details: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
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

    static async transferToken(req, res) {
        try {
            const { tokenId } = req.params;
            const { pricePerToken } = req.body;
            const newOwnerId = req.user.id;

            console.log('\n=== INÍCIO DA TRANSFERÊNCIA DE TOKEN ===');
            console.log('Dados recebidos:');
            console.log('- Token ID:', tokenId);
            console.log('- Preço por token:', pricePerToken);
            console.log('- Novo dono (ID):', newOwnerId);
            console.log('- Headers:', JSON.stringify(req.headers, null, 2));
            console.log('- Body completo:', JSON.stringify(req.body, null, 2));

            const trx = await db.transaction();
            console.log('\n=== INICIANDO TRANSAÇÃO ===');

            try {
                // Buscar o token
                console.log('\n=== BUSCANDO TOKEN ===');
                const token = await RWANFTToken.query(trx)
                    .findById(tokenId);
                    
                if (!token) {
                    console.log('Token não encontrado');
                    throw new Error('Token não encontrado');
                }
                console.log('Token encontrado:', JSON.stringify(token, null, 2));

                // Atualizar o dono do token
                console.log('\n=== ATUALIZANDO DONO DO TOKEN ===');
                console.log('Dono atual:', token.owner_user_id);
                console.log('Novo dono:', newOwnerId);
                
                const updatedToken = await RWANFTToken.query(trx)
                    .patchAndFetchById(tokenId, {
                        owner_user_id: newOwnerId
                    });
                console.log('Token atualizado:', JSON.stringify(updatedToken, null, 2));

                // Registrar a transação
                console.log('\n=== REGISTRANDO TRANSAÇÃO ===');
                const transactionData = {
                    token_id: tokenId,
                    from_user_id: token.owner_user_id,
                    to_user_id: newOwnerId,
                    transaction_type: 'sale',
                    price_per_token: pricePerToken,
                    created_at: new Date()
                };
                console.log('Dados da transação:', JSON.stringify(transactionData, null, 2));
                
                await trx('rwa_token_transactions').insert(transactionData);
                console.log('Transação registrada com sucesso');

                // Criar registro da venda
                console.log('\n=== CRIANDO REGISTRO DE VENDA ===');
                const saleData = {
                    rwa_id: token.rwa_id,
                    token_id: token.id,
                    seller_id: token.owner_user_id,
                    buyer_id: newOwnerId,
                    quantity: 1,
                    price_per_token: pricePerToken,
                    total_price: pricePerToken,
                    status: 'completed',
                    created_at: new Date()
                };
                console.log('Dados da venda:', JSON.stringify(saleData, null, 2));
                
                await trx('rwa_token_sales').insert(saleData);
                console.log('Venda registrada com sucesso');

                await trx.commit();
                console.log('\n=== TRANSAÇÃO CONCLUÍDA COM SUCESSO ===');
                
                const response = convertToCamelCase(updatedToken);
                console.log('\n=== RESPOSTA ENVIADA ===');
                console.log(JSON.stringify(response, null, 2));
                
                res.json(response);
            } catch (error) {
                console.error('\n=== ERRO DURANTE A TRANSAÇÃO ===');
                console.error('Erro:', error);
                console.error('Stack:', error.stack);
                await trx.rollback();
                throw error;
            }
        } catch (error) {
            console.error('\n=== ERRO AO TRANSFERIR TOKEN ===');
            console.error('Erro:', error);
            console.error('Stack:', error.stack);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = RWAController; 