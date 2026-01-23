// Global variables
let expenses = [];
const API_URL = '/api';

// When page loads
window.onload = function() {
    setTodayDate();
    checkServer();
    loadExpenses();
};

// Set today's date automatically
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
}

// Check if server is running
async function checkServer() {
    try {
        const response = await fetch(API_URL + '/health');
        const data = await response.json();
        document.getElementById('serverStatus').textContent = data.status;
    } catch (error) {
        document.getElementById('serverStatus').textContent = 'Offline';
        document.getElementById('serverStatus').style.color = '#e74c3c';
    }
}

// Handle form submit
document.getElementById('expenseForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const expense = {
        name: document.getElementById('name').value,
        amount: document.getElementById('amount').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };
    
    // Send to server
    try {
        const response = await fetch(API_URL + '/expenses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(expense)
        });
        
        if (response.ok) {
            alert('Expense added successfully!');
            document.getElementById('expenseForm').reset();
            setTodayDate();
            loadExpenses();
        }
    } catch (error) {
        alert('Error: Could not add expense');
    }
});

// Load all expenses from server
async function loadExpenses() {
    try {
        const response = await fetch(API_URL + '/expenses');
        expenses = await response.json();
        
        displayExpenses();
        updateSummary();
    } catch (error) {
        console.log('Error loading expenses');
    }
}

// Display expenses on page
function displayExpenses() {
    const listDiv = document.getElementById('expenseList');
    
    if (expenses.length === 0) {
        listDiv.innerHTML = '<p class="empty-msg">No expenses yet. Add your first one!</p>';
        return;
    }
    
    let html = '';
    expenses.forEach(expense => {
        html += `
            <div class="expense-item">
                <div class="expense-info">
                    <h4>${expense.name}</h4>
                    <p>${expense.category} • ${formatDate(expense.date)}</p>
                </div>
                <div class="expense-right">
                    <div class="expense-amount">₹${expense.amount}</div>
                    <button class="delete-btn" onclick="deleteExpense('${expense.id}')">Delete</button>
                </div>
            </div>
        `;
    });
    
    listDiv.innerHTML = html;
}

// Update summary cards
function updateSummary() {
    let total = 0;
    expenses.forEach(expense => {
        total += parseFloat(expense.amount);
    });
    
    document.getElementById('totalAmount').textContent = total.toFixed(2);
    document.getElementById('totalCount').textContent = expenses.length;
}

// Delete one expense
async function deleteExpense(id) {
    if (!confirm('Delete this expense?')) return;
    
    try {
        const response = await fetch(API_URL + '/expenses/' + id, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Expense deleted');
            loadExpenses();
        }
    } catch (error) {
        alert('Error: Could not delete');
    }
}

// Format date nicely
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

// DevOps Demo: Test high traffic
async function testHighTraffic() {
    const resultDiv = document.getElementById('testResult');
    resultDiv.classList.add('show');
    resultDiv.innerHTML = '<p>⏳ Sending 50 requests to server...</p>';
    
    const startTime = Date.now();
    let successCount = 0;
    let failCount = 0;
    
    // Send 50 parallel requests
    const promises = [];
    for (let i = 0; i < 50; i++) {
        promises.push(
            fetch(API_URL + '/test-load')
                .then(() => successCount++)
                .catch(() => failCount++)
        );
    }
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    resultDiv.innerHTML = `
        <p><strong>✅ Traffic Test Complete</strong></p>
        <p>Total Requests: 50</p>
        <p>Success: ${successCount} | Failed: ${failCount}</p>
        <p>Time Taken: ${duration}ms</p>
        <p>Average: ${(duration/50).toFixed(2)}ms per request</p>
    `;
}