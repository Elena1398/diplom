const Router = require('express')

const router = new Router()

const DesControllers = require('../controllers/des-controller')
const UsControllers = require('../controllers/user-controller')

router.post('/login', UsControllers.loginUser);
router.post('/registration', UsControllers.registrationUser);
router.get('/customer/:id', UsControllers.getcocustomersId);
router.put('/customer/:id', UsControllers.updateUser);
router.post('/change-password', UsControllers.changePassword)

router.get('/des', DesControllers.getDes)
router.get('/desert/:id', DesControllers.getDesert)
router.get('/desserts/:id/prices', DesControllers.getPrices);

router.get('/favourites', DesControllers.getFavorites)
// router.get('/favourites/:id', DesControllers.getFavoritesId)
router.post('/favourite', DesControllers.addFavorites)
router.delete('/favourite/:id', DesControllers.deleteFavorites)

router.get('/baskets', DesControllers.getBasket)
router.post('/basket', DesControllers.addBasket)
router.post('/baskets/update', DesControllers.updateBasket)
router.put('/baskets/update/:id', DesControllers.updateBasketId);
router.delete('/basket/:id', DesControllers.deleteBasket)


module.exports = router