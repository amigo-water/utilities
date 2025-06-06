import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database';

interface OtpAttributes {
  id: string;
  identifier: string; // Email or phone number
  otp_code: string;   // The actual OTP code (consider hashing for extra security)
  expires_at: Date;
  is_used: boolean;
  user_id?: string; // Optional: if OTP is always linked to a user
  created_at?: Date;
  updated_at?: Date;
}

interface OtpCreationAttributes extends Optional<OtpAttributes, 'id' | 'is_used' | 'created_at' | 'updated_at'> {}

export class Otp extends Model<OtpAttributes, OtpCreationAttributes> implements OtpAttributes {
  public id!: string;
  public identifier!: string;
  public otp_code!: string;
  public expires_at!: Date;
  public is_used!: boolean;
  public user_id?: string;

  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public static initialize(sequelize: Sequelize) {
    Otp.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: () => uuidv4(),
          primaryKey: true,
        },
        identifier: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        otp_code: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        expires_at: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        is_used: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        user_id: {
          type: DataTypes.UUID,
          allowNull: true, // Make true if OTP can be for non-logged-in actions
          references: {
            model: 'users', // Name of the Users table
            key: 'user_id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL', // Or 'CASCADE' depending on requirements
        },
      },
      {
        tableName: 'otps',
        sequelize,
        timestamps: true, // Automatically adds createdAt and updatedAt
      }
    );
  }

  // Optional: Define associations if needed, e.g., belongsTo User
  public static associate(models: any) {
    if (models.User) { // Ensure User model is passed in models object
        Otp.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });
    }
  }
}

// Example of how to initialize it in your main DB setup file:
// import { Sequelize } from 'sequelize';
// import { Otp } from './otp.model';
// import { User } from './user.model'; // Assuming User model is in the same directory or path
//
// const sequelize = new Sequelize(/* your db config */);
//
// const models = {
//   User,
//   Otp
// };
//
// User.initialize(sequelize);
// Otp.initialize(sequelize);
//
// User.associate(models);
// Otp.associate(models);
//
// export { sequelize, User, Otp };
