import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import './models/index.ts';
import policyRoutes from './routes/policy.routes'
import ruleRoutes from './routes/rule.routes'

import sequelize from './config/database';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3008;

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use('/api', policyRoutes)
app.use('/api/rules',ruleRoutes)


// Database connection
// Sync all models with the database
sequelize.sync({ alter: true }).then(()=>{
     console.log('Database synchronized')
});

// Error handleing middleware
// @ts-ignore
app.use((err,req,res,next)=>{
    console.log(err.stack);
    res.status(500).send('Something broke! ')
});

app.listen(PORT,()=>{
    console.log(`Policy Management Service running on port ${PORT}`)
})
