const express = require('express');
const cors = require('cors');
const helmet = require('helmet').default;

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.get('/', (req, res) => {
  res.send('Policy Management Service is running');
});

// Database connection
// Sync all models with the database
// sequelize.sync({ alter: true }).then(() => {
//   console.log('Database synchronized');
// });

// Error handling middleware
// @ts-ignore
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Policy Management Service running on port ${PORT}`);
});