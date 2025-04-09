const request = require('supertest');
const app = require('../app'); // Import your Express app
const User = require('../models/users'); // Ensure you are importing the correct model

describe('User Controller - create', () => {
    beforeEach(async () => {
        await User.destroy({ where: {}, truncate: true }); // Delete all records in the users table and reset the index
    }); 

    it('should create a new user', async () => {
        const mockUser = { 
            name: 'John Doe', 
            email: 'johndoe@example.com', 
            password: 'password123' 
        };

        const response = await request(app)
            .post('/api/users') // Replace with your route
            .send(mockUser);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.name).toBe(mockUser.name);
        expect(response.body.data.email).toBe(mockUser.email);
    });

    it('should return 400 for invalid input', async () => {
        const invalidUser = { name: '' }; // Missing required fields

        const response = await request(app)
            .post('/api/users')
            .send(invalidUser);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('error');
    });
});

describe('User Controller - find methods', () => {
    it('should return an array of users', async () => {
        const response = await request(app).get('/api/users');

        expect(response.status).toBe(200);
        expect(response.body.data).toBeInstanceOf(Array);
    });
    
    it('should return a user by id', async () => {
        await User.destroy({ where: {}, truncate: true }); // Delete all records in the users table and reset the index
        
        const mockUser = { 
            name: 'John Doe', 
            email: 'johndoe@example.com', 
            password: 'password123' 
        };
    
        const user = await request(app)
            .post('/api/users') // Replace with your route
            .send(mockUser);
    
        const response = await request(app)
            .get(`/api/users/${user.body.data.id}`);
    
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.id).toBe(user.body.data.id);
    });
});

describe('User Controller - update', () => {
    it('should update a user by id', async () => {
        await User.destroy({ where: {}, truncate: true }); // Delete all records in the users table and reset the index
        
        const mockUser = { 
            name: 'John Doe', 
            email: 'john@example.com',
            password: 'password123'
        };

        const user = await request(app)
            .post('/api/users')
            .send(mockUser);
        
        const updatedUser = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            password: 'newpassword'
        };

        const response = await request(app)
            .put(`/api/users/${user.body.data.id}`)
            .send(updatedUser);
        
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.name).toBe(updatedUser.name);
        expect(response.body.data.email).toBe(updatedUser.email);
    });
});

describe('User Controller - delete', () => {
    it('should delete a user by id', async () => {
        await User.destroy({ where: {}, truncate: true }); // Delete all records in the users table and reset the index
        
        const mockUser = { 
            name: 'John Doe', 
            email: 'john@example.com',
            password: 'password123'
        };

        const user = await request(app)
            .post('/api/users')
            .send(mockUser);

        const response = await request(app)
            .delete(`/api/users/${user.body.data.id}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('User deleted successfully');
    });
});
