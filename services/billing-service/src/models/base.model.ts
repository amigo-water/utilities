// src/models/base.model.ts
import { Model, ModelStatic, Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseModel<T extends {}, TCreate extends {} = T> extends Model<T, TCreate> {  public static associate?: (models: any) => void;
  
  public static initialize(sequelize: any) {
    throw new Error('Method not implemented');
  }

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}