const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

app.use(bodyParser.json());

const port = 3000;
const SECRET_KEY = 'your_secret_key';

// Mock Data
let users = [
    { id: '65d5dcf2861697f86ba444f1', phoneNumber: '9080544834', password: 'Password123@', accessToken: '' }
];

let tasks = [
    {
        _id: '6614f7312dcbbb87cf1aa9f7',
        userId: '65d5dcf2861697f86ba444f1',
        title: 'Test',
        description: 'Sample',
        status: 'in progress',
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
    }
];

// Helper Functions
const generateAccessToken = (user) => {
    return jwt.sign({ phoneNumber: user.phoneNumber }, SECRET_KEY, { expiresIn: '1h' });
};
app.get('/hi',(req,res)=>{
    res.send("Server running")
})
// Signup API
app.post('/signup', (req, res) => {
    const { phoneNumber, password } = req.body;

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
        return res.status(400).json({ error: 'Phone Number Invalid' });
    }

    const existingUser = users.find((user) => user.phoneNumber === phoneNumber);

    if (existingUser) {
        return res.status(400).json({ error: 'Phone Number is already Registered' });
    }

    const newUser = {
        id: `user${users.length + 1}`,
        phoneNumber,
        password,
        accessToken: ''
    };

    newUser.accessToken = generateAccessToken(newUser);
    users.push(newUser);

    res.json({
        status: 'Signup Successful',
        id: newUser.id,
        accessToken: newUser.accessToken
    });
});

// Login API
app.post('/login', (req, res) => {
    const { phoneNumber, password } = req.body;

    const user = users.find(
        (user) => user.phoneNumber === phoneNumber && user.password === password
    );

    if (!user) {
        return res.status(401).json({
            status: 'Login Failure',
            message: 'Either Phone Number or Password Mismatch'
        });
    }

    user.accessToken = generateAccessToken(user);

    res.json({
        status: 'Login Success',
        accessToken: user.accessToken
    });
});

// Get Tasks API
app.get('/tasks/:userId', (req, res) => {
    const { userId } = req.params;
    const userTasks = tasks.filter((task) => task.userId === userId);
    res.json(userTasks);
});

// Search Tasks API
app.get('/tasks/:userId', (req, res) => {
    const { userId } = req.params;
    const { searchTerm } = req.query;
    const userTasks = tasks.filter(
        (task) =>
            task.userId === userId &&
            (!searchTerm || task.title.includes(searchTerm))
    );
    res.json(userTasks);
});

// Add Task API
app.post('/tasks/:userId', (req, res) => {
    const { title, status,description } = req.body;
    const { userId } = req.params;
    const validStatuses = ['in progress', 'completed'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            error: {
                status: {
                    name: 'ValidatorError',
                    message: `${status} is not a valid value for status`,
                    kind: 'user defined',
                    path: 'status',
                    value: status
                }
            }
        });
    }

    const newTask = {
        _id: `task${tasks.length + 1}`,
        userId: userId, // Default user for demo
        title : title,
        description: description,
        status:status,
        createdAt: new Date().toISOString(),
        modifiedAt: new Date().toISOString()
    };

    tasks.push(newTask);
    res.json({ status: 'Task Added Successfully', id: newTask._id });
});

// Update Task API
app.put('/tasks/:userId/:taskId', (req, res) => { 
    const { userId, taskId } = req.params; 
    const { title, description, status } = req.body;

    // Check if the user exists
    const userTasks = tasks.filter(task => task.userId === userId);
    if (!userTasks.length) {
        return res.status(403).json({ error: "Not Authorized to access the resource" });
    }

    // Find the task by taskId for the given userId
    const task = userTasks.find(task => task._id === taskId);
    if (!task) {
        return res.status(404).json({ error: "Task Doesn't exist" });
    }

    // Update task fields
    task.title = title || task.title;
    task.description = description || task.description;
    task.status = status || task.status;
    task.modifiedAt = new Date().toISOString();

    res.json({ status: 'Task Updated' });
});


// Delete Task API
app.delete('/tasks/:taskId', (req, res) => {
    const { taskId } = req.params;

    const taskIndex = tasks.findIndex((task) => task._id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ error: "Task Doesn't exist" });
    }

    tasks.splice(taskIndex, 1);
    res.json({ status: 'Task Deleted Successfully' });
});

// Start the Server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

//test 


