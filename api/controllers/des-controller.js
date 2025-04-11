const db = require("../db");

class DesControllers {
  async getDes(req, res) {
    try {
      const section = req.query.section;
      const searchQuery = req.query.title;
      // const sectionPrice = req.query.sectionPrice;

      if (searchQuery) {
        const des = await db.query(
          "SELECT d.des_id, d.des_name, pl.price, d.photo " +
            "FROM desserts d " +
            "JOIN dessert_price_list dpl ON dpl.des_id = d.des_id " + 
            "JOIN price_list pl ON pl.price_list_id = dpl.price_list_id " + 
            "WHERE d.des_name ILIKE $1 " +
            "ORDER BY d.des_id ASC;",
          [`%${searchQuery}%`]
        );
        return res.json(des.rows);
      }

      if (section === "title") {
        const des = await db.query(
          "SELECT d.des_id, d.des_name, pl.weight, pl.price, d.photo " +
            "FROM desserts d " +
            "JOIN dessert_price_list dpl ON dpl.des_id = d.des_id " + 
            "JOIN price_list pl ON pl.price_list_id = dpl.price_list_id " + 
            "ORDER BY d.des_id ASC"
        );
        return res.json(des.rows);
      }

      if (section) {
        // Проверяем только наличие section
        const des = await db.query(
          "SELECT d.des_id, d.des_name, pl.price, d.photo " + 
          "FROM desserts d " + 
          "LEFT JOIN dessert_price_list dpl ON dpl.des_id = d.des_id " + 
          "LEFT JOIN price_list pl ON pl.price_list_id = dpl.price_list_id " + 
          "WHERE categ_des_id = $1 ORDER BY d.des_id ASC",
          [section]
        );
        return res.json(des.rows);
      }

      //   if (sectionPrice) {
      //     const [minPrice, maxPrice] = sectionPrice.split('-').map(Number); // Преобразуем строку в массив чисел
      //     const des = await db.query(
      //       'SELECT d.des_id, d.des_name, cd.weight, cd.price, d.photo ' +
      //       'FROM characteristics_dessert cd ' +
      //       'JOIN parameters_des pd ON cd.char_des_id = pd.char_des_id ' +
      //       'JOIN desserts d ON pd.des_id = d.des_id ' +
      //       'WHERE cd.price BETWEEN $1 AND $2;',
      //       [minPrice, maxPrice] // Используем параметры для минимальной и максимальной цены
      //     );
      //     return res.json(des.rows);
      // }
      return res.json([]); // Возвращаем пустой массив или сообщение
    } catch (error) {
      console.error("Error fetching desserts:", error);
      res.status(500).json({ message: "Internal server error" }); // Обработка ошибок
    }
  }

  async getDesert(req, res) {
    try {
      const id = req.params.id;
      const desert = await db.query(
        "SELECT d.des_id, d.des_name, nv.protein,nv.fast,nv.carbohydrates, nv.calories, pl.weight, pl.price, d.description, " +
          " string_agg(i.inredient_name, ', ') AS ingredients, d.photo " +
          "FROM desserts d " +
          "JOIN category_desserts cd ON d.categ_des_id = cd.categ_des_id " +
          "JOIN nutritional_value nv ON d.nut_val_id = nv.nut_val_id " +
          "LEFT JOIN dessert_price_list dpl ON dpl.des_id = d.des_id " + 
          "LEFT JOIN price_list pl ON pl.price_list_id = dpl.price_list_id " + 
          "LEFT JOIN sostav_desserts sd ON d.des_id = sd.des_id " +
          "LEFT JOIN inredients i ON i.inredients_id= sd.inredients_id " +
          "WHERE d.des_id = $1 GROUP BY d.des_id, cd.categ_des_name, nv.protein, nv.fast, nv.carbohydrates, nv.calories, pl.weight, pl.price;",
        [id]
      );
      res.json(desert.rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving des", error });
    }
  }

  async getFavorites(req, res) {
    try {
      // в дальнейшем нужен будет еще id клиента
      const favouritesDes = await db.query(
        "SELECT  f.favor_id, f.des_id, d.des_name, dpl.price_list_id, pl.weight, pl.price, d.photo " + 
        "FROM favourites f " + 
        "LEFT JOIN desserts d ON d.des_id = f.des_id " + 
        "LEFT JOIN dessert_price_list dpl ON dpl.des_id = d.des_id " + 
        "LEFT JOIN price_list pl ON pl.price_list_id = dpl.price_list_id " + 
        "ORDER BY f.favor_id ASC; ");
      return res.json(favouritesDes.rows);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving desserts", error });
    }
  }

  async addFavorites(req, res) {
    try {
      const { desertId } = req.body;
      const newFavor = await db.query(
        "INSERT INTO public.favourites(des_id) " + "VALUES ($1) RETURNING *",
        [desertId]
      );
      return res.json(newFavor.rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving desert", error });
    }
  }

  async deleteFavorites(req, res) {
    try {
      const id = req.params.id;
      const favDel = await db.query(
        "DELETE FROM public.favourites WHERE favor_id = $1",
        [id]
      );
      return res.json(favDel.rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving desert", error });
    }
  }

  async getBasket(req, res) {
    try {
      // в дальнейшем нужен будет еще id клиента
      const basketDes = await db.query(
        "SELECT bas.bas_id, bas.des_id, d.des_name, dpl.price_list_id, pl.weight, pl.price, d.photo " + 
        "FROM baskets bas " + 
        "LEFT JOIN desserts d ON d.des_id = bas.des_id " + 
        "LEFT JOIN dessert_price_list dpl ON dpl.des_id = d.des_id " +
        "LEFT JOIN price_list pl ON pl.price_list_id = dpl.price_list_id " + 
        "ORDER BY bas.bas_id ASC;");
      return res.json(basketDes.rows);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving desserts", error });
    }
  }

  async addBasket(req, res) {
    try {
      const { desertId } = req.body;
      const newBask = await db.query(
        "INSERT INTO public.baskets(des_id)" + "VALUES ($1) RETURNING *;",
        [desertId]
      );
      return res.json(newBask.rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving desert", error });
    }
  }

  async deleteBasket(req, res) {
    try {
      const id = req.params.id;
      const BaskDel = await db.query(
        "DELETE FROM public.baskets WHERE bas_id = $1",
        [id]
      );
      return res.json(BaskDel.rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving desert", error });
    }
  }

  async Login(req, res) {
    try {
      const id = req.params.id;
      const BaskDel = await db.query(
        "DELETE FROM public.baskets WHERE bas_id = $1",
        [id]
      );
      return res.json(BaskDel.rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving desert", error });
    }
  }

}

module.exports = new DesControllers();
