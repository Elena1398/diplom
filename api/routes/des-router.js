const Router = require("express");
const router = new Router();
const path = require("path");
const multer = require("multer");

const DesControllers = require("../controllers/des-controller");
const UsControllers = require("../controllers/user-controller");

// Настройка multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "vue-confectioner", "public", "photo"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `adddesserts-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// router.post('/adddesserts', DesControllers.addDessert);
// Передаём upload.single для загрузки файла обложки
router.post("/adddesserts", DesControllers.addDessert);
router.post("/adddesserts/upload", upload.single("image"), (req, res) => {
 
  if (!req.file) {
    return res.status(400).json({ message: "Файл не загружен" });
  }

  // Сформировать путь в нужном формате
  const filePath = `..\\..\\photo\\${req.file.filename}`;
  res.json({ filePath });
});
router.put("/adddesserts/:id", DesControllers.updateDessert);

router.post("/login", UsControllers.loginUser);
router.post("/registration", UsControllers.registrationUser);
router.get("/customer/:id", UsControllers.getcocustomersId);
router.get("/admin/:id", UsControllers.getadminsId);
router.put("/customer/:id", UsControllers.updateUser);
router.put("/admin/:id", UsControllers.updateAdmin);
router.post("/change-password", UsControllers.changePassword);
router.post("/admin-change-password", UsControllers.changeAdminPassword);
router.post("/create-order", UsControllers.createOrder);
router.get("/my-orders/:id", UsControllers.getOrdersByCustomer);

router.get("/des", DesControllers.getDes);
router.get("/desert/:id", DesControllers.getDesert);
router.get("/deserts/:id", DesControllers.getDeserts);
router.get("/desserts/:id/prices", DesControllers.getPrices);
router.get("/price_list", DesControllers.getPriceList);
router.delete("/desert/:id", DesControllers.deleteDessert);

router.get("/favourites", DesControllers.getFavorites);
// router.get('/favourites/:id', DesControllers.getFavoritesId)
router.post("/favourite", DesControllers.addFavorites);
router.delete("/favourite/:id", DesControllers.deleteFavorites);

router.get("/baskets", DesControllers.getBasket);
router.post("/basket", DesControllers.addBasket);
router.post("/baskets/update", DesControllers.updateBasket);
router.put("/baskets/update/:id", DesControllers.updateBasketId);
router.delete("/basket/:id", DesControllers.deleteBasket);
router.post("/baskets/clear", UsControllers.clearBasketByCustomer);

module.exports = router;
