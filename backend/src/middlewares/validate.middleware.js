import { ZodError } from 'zod';

export const validate = (schema) => async (req, res, next) => {
  try {
    const parsed = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    
    req.body = parsed.body;
    
    if (parsed.query) {
      Object.assign(req.query, parsed.query);
    }
    
    if (parsed.params) {
      Object.assign(req.params, parsed.params);
    }
    
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const validationDetails = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationDetails[0]?.message || 'Invalid input data',
          details: validationDetails,
        },
      });
    }

    next(error);
  }
};