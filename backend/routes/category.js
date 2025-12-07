import expess from 'express'
import * as controller from '../controllers/category'

const router = expess.Router()

router.get('/all', controller.getCategories)

export default router