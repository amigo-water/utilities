const express = require('express');
const cors = require('cors');
const helmet = require('helmet').default;
const policyRoutes = require('./routes/policyRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const bodyParser = require('body-parser');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

// Routes
app.use('/api', policyRoutes);
app.use('/api/rules', ruleRoutes);

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

const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
  console.log(`Policy Management Service running on port ${PORT}`);
});