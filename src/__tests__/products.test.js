const request = require('supertest');
const app = require('./setup');

describe('Products Endpoints', () => {
  describe('GET /api/products', () => {
    it('should return all products', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/products/category/:categoryId', () => {
    it('should return products by category', async () => {
      const response = await request(app)
        .get('/api/products/category/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(product => {
        expect(product).toHaveProperty('categoryId', 1);
      });
    });
  });

  describe('GET /api/products/search', () => {
    it('should return products matching search term', async () => {
      const response = await request(app)
        .get('/api/products/search?q=test')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 400 when search term is missing', async () => {
      const response = await request(app)
        .get('/api/products/search')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Termo de busca não fornecido');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should return a specific product', async () => {
      const response = await request(app)
        .get('/api/products/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('price');
      expect(response.body).toHaveProperty('stock');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Produto não encontrado');
    });
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'New Product',
          description: 'Test Description',
          price: 99.99,
          stock: 100,
          categoryId: 1
        })
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'New Product');
      expect(response.body).toHaveProperty('description', 'Test Description');
      expect(response.body).toHaveProperty('price', 99.99);
      expect(response.body).toHaveProperty('stock', 100);
      expect(response.body).toHaveProperty('categoryId', 1);
    });
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const response = await request(app)
        .put('/api/products/1')
        .send({
          name: 'Updated Product',
          price: 149.99
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'Updated Product');
      expect(response.body).toHaveProperty('price', 149.99);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .put('/api/products/999')
        .send({
          name: 'Updated Product'
        })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Produto não encontrado');
    });
  });

  describe('PATCH /api/products/:id/stock', () => {
    it('should update product stock', async () => {
      const response = await request(app)
        .patch('/api/products/1/stock')
        .send({
          stock: 50
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('stock', 50);
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .patch('/api/products/999/stock')
        .send({
          stock: 50
        })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Produto não encontrado');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const response = await request(app)
        .delete('/api/products/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Produto deletado com sucesso');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/999')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Produto não encontrado');
    });
  });
}); 