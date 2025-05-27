import { Sequelize, Dialect, Model, ModelStatic } from 'sequelize';
import dotenv from 'dotenv';
import { URL } from 'url';
import path from 'path';
import fs from 'fs';

dotenv.config();

interface DatabaseConfig {
  url: string;
  dialect: Dialect;
  logging: boolean | ((sql: string) => void);
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

// Custom interface for models with associate method
interface ModelStaticWithAssociate<T extends Model> extends ModelStatic<T> {
  associate?: (models: { [key: string]: ModelStatic<Model> }) => void;
  initialize?: (sequelize: Sequelize) => void;
  name?: string;
}

class DatabaseConfiguration {
  private static instance: DatabaseConfiguration;
  private config: DatabaseConfig;

  private constructor() {
    const url = process.env.DATABASE_URL || 
      `postgres://${encodeURIComponent(process.env.DB_USER || 'postgres')}:${encodeURIComponent(process.env.DB_PASSWORD || 'root')}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'Billing'}`;

    // Validate URL early
    try {
      new URL(url);
    } catch (error: any) {
      throw new Error(`Invalid database URL: ${error.message}`);
    }

    this.config = {
      url,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: parseInt(process.env.DB_POOL_MAX || '5'),
        min: parseInt(process.env.DB_POOL_MIN || '0'),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE || '30000'),
        idle: parseInt(process.env.DB_POOL_IDLE || '10000'),
      },
    };
  }

  public static getInstance(): DatabaseConfiguration {
    if (!DatabaseConfiguration.instance) {
      DatabaseConfiguration.instance = new DatabaseConfiguration();
    }
    return DatabaseConfiguration.instance;
  }

  public getConfig(): DatabaseConfig {
    return this.config;
  }
}

// Use only the URL and options separately
const dbConfig = DatabaseConfiguration.getInstance().getConfig();

// Function to import all models
const importModels = (sequelize: Sequelize) => {
  const modelsDir = path.join(__dirname, '../models');
  const modelFiles = fs.readdirSync(modelsDir)
    .filter(file => 
      file.indexOf('.') !== 0 && 
      file !== 'index.ts' && 
      file.slice(-3) === '.ts'
    );

  const models: { [key: string]: ModelStaticWithAssociate<Model> } = {};
  
  modelFiles.forEach(file => {
    const model = require(path.join(modelsDir, file)).default;
    if (model && typeof model.initialize === 'function') {
      model.initialize(sequelize);
      models[model.name] = model;
    }
  });

  // Set up associations if they exist
  Object.values(models).forEach(model => {
    if (model.associate) {
      model.associate(models);
    }
  });

  return models;
};

// Create database connection
const sequelize = new Sequelize(dbConfig.url, {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  pool: dbConfig.pool,
});

// Import and initialize all models
const models = importModels(sequelize);

// Authenticate and sync database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: true }); // Use { force: true } to drop and recreate tables
    console.log('Database synchronized successfully.');
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// syncDatabase();

export { sequelize, models };
