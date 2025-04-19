const users = [
    {
        id: 1,
        name: 'João Silva',
        email: 'joao@email.com',
        password: '123456',
        role: 'admin',
        createdAt: new Date('2024-01-01')
    },
    {
        id: 2,
        name: 'Maria Santos',
        email: 'maria@email.com',
        password: '123456',
        role: 'user',
        createdAt: new Date('2024-01-02')
    }
];

const categories = [
    {
        id: 1,
        name: 'Eletrônicos',
        description: 'Produtos eletrônicos em geral',
        createdAt: new Date('2024-01-01')
    },
    {
        id: 2,
        name: 'Computadores',
        description: 'Computadores e notebooks',
        createdAt: new Date('2024-01-01')
    },
    {
        id: 3,
        name: 'Acessórios',
        description: 'Acessórios para eletrônicos',
        createdAt: new Date('2024-01-01')
    }
];

const products = [
    {
        id: 1,
        name: 'Smartphone XYZ',
        description: 'Um smartphone incrível',
        price: 1999.99,
        stock: 10,
        categoryId: 1,
        category: 'Eletrônicos',
        createdAt: new Date('2024-01-01')
    },
    {
        id: 2,
        name: 'Notebook ABC',
        description: 'Notebook para trabalho e jogos',
        price: 4999.99,
        stock: 5,
        categoryId: 2,
        category: 'Computadores',
        createdAt: new Date('2024-01-02')
    },
    {
        id: 3,
        name: 'Fone de Ouvido',
        description: 'Fone sem fio com cancelamento de ruído',
        price: 299.99,
        stock: 20,
        categoryId: 3,
        category: 'Acessórios',
        createdAt: new Date('2024-01-03')
    }
];

const orders = [
    {
        id: 1,
        userId: 2,
        items: [
            {
                productId: 1,
                quantity: 1,
                price: 1999.99
            },
            {
                productId: 3,
                quantity: 2,
                price: 299.99
            }
        ],
        total: 2599.97,
        status: 'Pendente',
        createdAt: new Date('2024-01-10')
    },
    {
        id: 2,
        userId: 2,
        items: [
            {
                productId: 2,
                quantity: 1,
                price: 4999.99
            }
        ],
        total: 4999.99,
        status: 'Entregue',
        createdAt: new Date('2024-01-15')
    }
];

module.exports = {
    users,
    categories,
    products,
    orders
}; 