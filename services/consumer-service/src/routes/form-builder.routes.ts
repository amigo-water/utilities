import { Router } from 'express';
import formBuilderController from '../controllers/form-builder.controller';

const router = Router({ mergeParams: true });

router.post('/utilities/:utilityId/attributes', formBuilderController.createAttributeTemplate);
router.get('/utilities/:utilityId/attributes', formBuilderController.getAttributeTemplates);
router.put('/utilities/:utilityId/attributes/:templateId', formBuilderController.updateAttributeTemplate);
router.delete('/utilities/:utilityId/attributes/:templateId', formBuilderController.deleteAttributeTemplate);

router.post('/utilities/:utilityId/forms', formBuilderController.createForm);
router.get('/utilities/:utilityId/forms', formBuilderController.listForms);
router.put('/forms/:formId', formBuilderController.updateForm);
router.delete('/forms/:formId', formBuilderController.deleteForm);

router.post('/forms/:formId/attributes', formBuilderController.addAttributeToForm);
router.get('/forms/:formId/attributes', formBuilderController.getFormAttributes);
router.put('/form_attributes/:formAttributeId', formBuilderController.updateFormAttribute);
router.delete('/form_attributes/:formAttributeId', formBuilderController.removeAttributeFromForm);

export default router;