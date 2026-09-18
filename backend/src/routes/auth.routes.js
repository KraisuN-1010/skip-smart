import express from 'express';
import { 
    signup, 
    verifyEmail, 
    login, 
    refresh, 
    logout, 
    logoutAll 
} from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { 
    registerSchema, 
    verifyEmailSchema, 
    loginSchema, 
    refreshTokenSchema 
} from '../schemas/auth.schema.js';

const router = express.Router();

router.post('/register', validate(registerSchema), signup);
router.post('/verify-email', validate(verifyEmailSchema), verifyEmail);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', validate(refreshTokenSchema), refresh);
router.post('/logout', validate(refreshTokenSchema), logout);
router.post('/logout-all', logoutAll);

export default router;