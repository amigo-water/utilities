// src/models/rule-execution-stats.model.ts

import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface IRuleExecutionStatsAttributes {
  id: string;
  rule_id?: string;
  evaluation_count?: number;
  avg_execution_time_ms?: number;
  success_count?: number;
  failure_count?: number;
  last_executed?: Date;
  last_status?: string;
}

export type RuleExecutionStatsCreationAttributes = Omit<IRuleExecutionStatsAttributes, 'id'>;

export class RuleExecutionStats
  extends Model<IRuleExecutionStatsAttributes, RuleExecutionStatsCreationAttributes>
  implements IRuleExecutionStatsAttributes
{
  public id!: string;
  public rule_id?: string;
  public evaluation_count?: number;
  public avg_execution_time_ms?: number;
  public success_count?: number;
  public failure_count?: number;
  public last_executed?: Date;
  public last_status?: string;
}

RuleExecutionStats.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    rule_id: {
      type: DataTypes.UUID,
      references: {
        model: 'rules',
        key: 'id'
      }
    },
    evaluation_count: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    },
    avg_execution_time_ms: {
      type: DataTypes.DECIMAL
    },
    success_count: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    },
    failure_count: {
      type: DataTypes.BIGINT,
      defaultValue: 0
    },
    last_executed: {
      type: DataTypes.DATE
    },
    last_status: {
      type: DataTypes.STRING(20)
    }
  },
  {
    sequelize,
    modelName: 'RuleExecutionStats',
    tableName: 'rule_execution_stats',
    timestamps: false
  }
);

export default RuleExecutionStats;
