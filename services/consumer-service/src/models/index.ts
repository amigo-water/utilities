import Consumer from './consumer.model';
import Utility from './utility.model';
import ConsumerCategory from './consumer-category.model';
import ConsumerStatus from './consumer-status.model';
import OrganizationUnit from './organization-unit.model';
import Connection from './connection.model';
import ConnectionType from './connection-type.model';
import ConsumerEvent from './consumer-event.model';
import {ConsumerSnapshot, SnapshotCorrectionRequest } from './consumer-snapshot.model';
import { ConsumerAttributeLatest, ConsumerAttributeHistory } from './consumer-attribute.model';
import { ApprovalRequest, ApprovalLevel, ApprovalConfiguration } from './approval.model';
import AttributeTemplate from './attribute-template.model';
import { SchemeMaster, SchemeEnrollmentRequest, SchemeEligibilityLog } from './scheme.model';
import ValidationRule from './validation-rule.model';

// Associations
Consumer.belongsTo(Utility, { foreignKey: 'utilityId', as: 'utility' });
Consumer.belongsTo(ConsumerCategory, { foreignKey: 'categoryId', as: 'category' });
Consumer.belongsTo(ConsumerStatus, { foreignKey: 'status', as: 'consumerStatus' });
Consumer.belongsTo(OrganizationUnit, { foreignKey: 'organizationUnitId', as: 'organizationUnit' });
Consumer.hasMany(Connection, { foreignKey: 'consumerId', as: 'connections' });
Consumer.hasMany(ConsumerEvent, { foreignKey: 'consumerId', as: 'events' });
Consumer.hasMany(ConsumerSnapshot, { foreignKey: 'consumerId', as: 'snapshots' });
Consumer.hasMany(ConsumerAttributeLatest, { foreignKey: 'consumerId', as: 'latestAttributes' });
Consumer.hasMany(ConsumerAttributeHistory, { foreignKey: 'consumerId', as: 'attributeHistory' });
Consumer.hasMany(ApprovalRequest, { foreignKey: 'consumerId', as: 'approvalRequests' });
Consumer.hasMany(SchemeEnrollmentRequest, { foreignKey: 'consumerId', as: 'schemeEnrollments' });
Consumer.hasMany(SchemeEligibilityLog, { foreignKey: 'consumerId', as: 'eligibilityLogs' });

ConsumerCategory.hasMany(Consumer, { foreignKey: 'categoryId', as: 'consumers' ,onDelete:'CASCADE'});
Connection.belongsTo(Consumer, { foreignKey: 'consumerId', as: 'consumer' });
Connection.belongsTo(OrganizationUnit, { foreignKey: 'organizationUnitId', as: 'organizationUnit' });
Connection.belongsTo(ConnectionType, { foreignKey: 'connectionType', as: 'connectionTypeDetails' });

ApprovalRequest.belongsTo(Consumer, { foreignKey: 'consumerId', as: 'consumer' });
ApprovalRequest.hasMany(ApprovalLevel, { foreignKey: 'requestId', as: 'levels' });
ApprovalLevel.belongsTo(ApprovalRequest, { foreignKey: 'requestId', as: 'approvalRequest' });

ApprovalConfiguration.belongsTo(Utility, { foreignKey: 'utilityId', as: 'utility' });
ApprovalRequest.belongsTo(Utility, { foreignKey: 'utilityId', as: 'utility' });

ConsumerEvent.belongsTo(Consumer, { foreignKey: 'consumerId', as: 'consumer' });
ConsumerSnapshot.belongsTo(Consumer, { foreignKey: 'consumerId', as: 'consumer' });
SnapshotCorrectionRequest.belongsTo(ConsumerSnapshot, { foreignKey: 'snapshotId', as: 'snapshot' });

ConsumerAttributeLatest.belongsTo(Consumer, { foreignKey: 'consumerId', as: 'consumer' });
ConsumerAttributeHistory.belongsTo(Consumer, { foreignKey: 'consumerId', as: 'consumer' });

SchemeMaster.belongsTo(Utility, { foreignKey: 'utilityId', as: 'utility' });
SchemeEnrollmentRequest.belongsTo(Consumer, { foreignKey: 'consumerId', as: 'consumer' });
SchemeEnrollmentRequest.belongsTo(SchemeMaster, { foreignKey: 'schemeId', as: 'scheme' });
SchemeEligibilityLog.belongsTo(Consumer, { foreignKey: 'consumerId', as: 'consumer' });
SchemeEligibilityLog.belongsTo(SchemeMaster, { foreignKey: 'schemeId', as: 'scheme' });

ValidationRule.belongsTo(Utility, { foreignKey: 'utilityId', as: 'utility' });

OrganizationUnit.belongsTo(Utility, { foreignKey: 'utilityId' });
OrganizationUnit.hasMany(OrganizationUnit, { foreignKey: 'parentId', as: 'children' });
OrganizationUnit.belongsTo(OrganizationUnit, { foreignKey: 'parentId', as: 'parent' });

Utility.hasMany(ConsumerCategory, {
  foreignKey: 'utilityId',
  onDelete: 'CASCADE',
});

Utility.hasMany(OrganizationUnit, {
  foreignKey: 'utilityId',
  onDelete: 'CASCADE',
});

ConsumerCategory.belongsTo(Utility, {
  foreignKey: 'utilityId',
});


export {
  Consumer,
  Utility,
  ConsumerCategory,
  ConsumerStatus,
  OrganizationUnit,
  Connection,
  ConnectionType,
  ConsumerEvent,
  ConsumerSnapshot,
  SnapshotCorrectionRequest,
  ConsumerAttributeLatest,
  ConsumerAttributeHistory,
  ApprovalRequest,
  ApprovalLevel,
  ApprovalConfiguration,
  AttributeTemplate,
  SchemeMaster,
  SchemeEnrollmentRequest,
  SchemeEligibilityLog,
  ValidationRule
};