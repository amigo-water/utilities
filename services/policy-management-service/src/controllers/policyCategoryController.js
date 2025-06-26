const categoryService = require('../services/policyCategoryService');

exports.createCategory = async (req, res) => {
  try {
    const { name, utilityTypeId } = req.body;

    if (!name || !utilityTypeId) {
      return res.status(400).json({ error: 'Category name and utility type ID are required' });
    }

    const result = await categoryService.createCategory(req.body);
    return res.status(201).json(result);

  } catch (error) {
    console.error('Create Category Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createPolicyWithCategory = async (req, res) => {
  try {
    const result = await categoryService.createPolicyWithCategory(req.body);
    res.status(201).json({ message: 'Policy created successfully', data: result });
  } catch (error) {
    console.error('Error creating policy:', error);
    res.status(500).json({ message: 'Policy creation failed', error: error.message });
  }
};
