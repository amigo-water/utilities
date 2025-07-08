import { Router } from 'express';
import formBuilderController from '../controllers/form-builder.controller';

const router = Router({ mergeParams: true });

// Attribute template CRUD
router.post('/utilities/:utilityId/attributes', formBuilderController.createAttributeTemplate);
router.get('/utilities/:utilityId/attributes', formBuilderController.getAttributeTemplates);
router.get('/utilities/:utilityId/attributes/:templateId', formBuilderController.getAttributeTemplate);
router.put('/utilities/:utilityId/attributes/:templateId', formBuilderController.updateAttributeTemplate);
router.delete('/utilities/:utilityId/attributes/:templateId', formBuilderController.deleteAttributeTemplate);

// Form generation
router.get('/utilities/:utilityId/form-schema', formBuilderController.generateFormSchema);

export default router;