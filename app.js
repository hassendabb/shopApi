const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const cors = require('cors');

const authRoutes = require('./routers/authRoutes.js');
const itemRoutes = require('./routers/itemRoutes.js');
const orderRoutes = require('./routers/orderRoutes.js');

const authMiddleware = require('./middlewares/authMiddleware.js');
const authorizationMiddleware = require('./middlewares/authorizationMiddleware.js');
const validationMiddleware = require('./middlewares/validationMiddleware.js');

const app = express();


// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());

// Connect to MongoDB database
// mongoose.connect('mongodb+srv://nkhaskho:smibBcNyTULZPEKo@cluster0.kl37sg4.mongodb.net/newFares?retryWrites=true&w=majority')
//   .then(conn => { })
//   .catch(err => { console.log("errrr") });

mongoose.connect('mongodb://localhost:27017/nodeProject',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)
  .then(conn => { })
  .catch(err => { console.log("errrr") });


console.log('connected to DB!');

// Routes

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/orders', validationMiddleware, authMiddleware, authorizationMiddleware(['client', 'admin', 'owner']), orderRoutes);
app.use('/api/v1/items', validationMiddleware, authMiddleware, authorizationMiddleware(['admin', 'owner']), itemRoutes);
console.log('Routes!');

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});


const PORT = process.env.PORT || 8082;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log('http://localhost:' + PORT);
});

module.exports = app;
