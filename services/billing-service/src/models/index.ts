// src/models/index.ts
import { Bill } from './bill.model';
import { BillComponent } from './bill-component.model';
import { AgreedQuantity } from './agreed-quantity.model';
import { MeterReading } from './meter-reading.model';
import { BillStatusAudit } from './bill-status-audit.model';

// Define associations
const setupAssociations = () => {
  // Bill has many BillComponents
  Bill.hasMany(BillComponent, {
    foreignKey: 'billId',
    as: 'components',
  });

  // BillComponent belongs to Bill
  BillComponent.belongsTo(Bill, {
    foreignKey: 'billId',
    as: 'bill',
  });

  // Bill has many BillStatusAudit entries
  Bill.hasMany(BillStatusAudit, {
    foreignKey: 'billId',
    as: 'statusHistory',
  });

  // BillStatusAudit belongs to Bill
  BillStatusAudit.belongsTo(Bill, {
    foreignKey: 'billId',
    as: 'bill',
  });
};

export {
  Bill,
  BillComponent,
  AgreedQuantity,
  MeterReading,
  BillStatusAudit,
  setupAssociations,
};