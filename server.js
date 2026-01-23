const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory data storage (no database used)
let expenses = [];
let requestCounter = 0;

// Server start time
const startTime = Date.now();

// ==============================================
// API ROUTES
// ==============================================

// Health check - shows server is running
app.get('/api/health', (req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000);
    res.json({
        status: 'Online',
        uptime: uptime + ' seconds',
        totalRequests: requestCounter
    });
});

// Get all expenses
app.get('/api/expenses', (req, res) => {
    requestCounter++;
    res.json(expenses);
});

// Add new expense
app.post('/api/expenses', (req, res) => {
    requestCounter++;
    
    const { name, amount, category, date } = req.body;
    
    // Create new expense
    const newExpense = {
        id: Date.now().toString(),
        name: name,
        amount: amount,
        category: category,
        date: date,
        createdAt: new Date()
    };
    
    expenses.push(newExpense);
    
    res.json({
        success: true,
        expense: newExpense
    });
});

// Delete one expense
app.delete('/api/expenses/:id', (req, res) => {
    requestCounter++;
    
    const id = req.params.id;
    expenses = expenses.filter(exp => exp.id !== id);
    
    res.json({
        success: true,
        message: 'Expense deleted'
    });
});

// Test endpoint for high traffic simulation
app.get('/api/test-load', (req, res) => {
    requestCounter++;
    
    // Simulate some work
    let sum = 0;
    for (let i = 0; i < 100000; i++) {
        sum += i;
    }
    
    res.json({
        message: 'Load test OK',
        requestNumber: requestCounter
    });
});

// ==============================================
// SERVE FRONTEND
// ==============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==============================================
// START SERVER
// ==============================================

app.listen(PORT, '0.0.0.0', () => {
    console.log('========================================');
    console.log('🚀 Expense Tracker Server Started');
    console.log('========================================');
    console.log(`📍 Running on: http://localhost:${PORT}`);
    console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📊 API Base: http://localhost:${PORT}/api`);
    console.log('========================================');
});