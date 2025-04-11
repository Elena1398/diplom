const Router = require('express')

const router = new Router()

const DesControllers = require('../controllers/des-controller')

router.get('/des', DesControllers.getDes)
router.get('/desert/:id', DesControllers.getDesert)

router.get('/favourites', DesControllers.getFavorites)
router.post('/favourite', DesControllers.addFavorites)
router.delete('/favourite/:id', DesControllers.deleteFavorites)

router.get('/baskets', DesControllers.getBasket)
router.post('/basket', DesControllers.addBasket)
router.delete('/basket/:id', DesControllers.deleteBasket)


module.exports = router