const db = require("../db");

class DesControllers {
  async getDes(req, res) {
    try {
      const section = req.query.section;
      const searchQuery = req.query.title;
      const tastes = req.query.tastes;

      let baseQuery = `
      SELECT DISTINCT d.des_id, d.des_name, pl.price, d.photo
      FROM desserts d
      LEFT JOIN dessert_price_list dpl ON dpl.des_id = d.des_id
      LEFT JOIN price_list pl ON pl.price_list_id = dpl.price_list_id
      LEFT JOIN sostav_desserts sd ON sd.des_id = d.des_id
      LEFT JOIN inredients i ON i.inredients_id = sd.inredients_id
      LEFT JOIN category_tastes ct ON ct.inredients_id = i.inredients_id
      LEFT JOIN tastes t ON t.tastes_id = ct.tastes_id
      WHERE pl.weight = (
        SELECT MIN(pl2.weight)
        FROM dessert_price_list dpl2
        JOIN price_list pl2 ON pl2.price_list_id = dpl2.price_list_id
        WHERE dpl2.des_id = d.des_id
      )
    `;

      const params = [];
      const conditions = [];

      if (searchQuery) {
        params.push(`%${searchQuery}%`);
        conditions.push(`d.des_name ILIKE $${params.length}`);
      }

      if (section && section !== "title") {
        params.push(section);
        conditions.push(`d.categ_des_id = $${params.length}`);
      }

      if (tastes && tastes !== "tastes") {
        params.push(tastes);
        conditions.push(`t.tastes_id = $${params.length}`);
      }

      if (conditions.length > 0) {
        baseQuery += " AND " + conditions.join(" AND ");
      }

      baseQuery += " ORDER BY d.des_id ASC;";

      const des = await db.query(baseQuery, params);
      return res.json(des.rows);
    } catch (error) {
      console.error("Error fetching desserts:", error);
      res.status(500).json({ message: "Internal server error" });
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

  async getDeserts(req, res) {
    try {
      const id = req.params.id;
      const desert = await db.query(
        `SELECT d.des_id, d.des_name AS title, cd.categ_des_id AS categoryId,cd.categ_des_name AS categoryName,nv.protein, nv.fast, nv.carbohydrates, nv.calories, pl.weight, pl.price, d.description, d.photo,t.tastes_id AS "tasteId",
            (
              SELECT string_agg(DISTINCT i2.inredient_name, ', ')
              FROM sostav_desserts sd2
              JOIN inredients i2 ON sd2.inredients_id = i2.inredients_id
              WHERE sd2.des_id = d.des_id
            ) AS ingredients
          FROM desserts d
          JOIN category_desserts cd ON d.categ_des_id = cd.categ_des_id 
          JOIN nutritional_value nv ON d.nut_val_id = nv.nut_val_id 
          LEFT JOIN dessert_price_list dpl ON dpl.des_id = d.des_id 
          LEFT JOIN price_list pl ON pl.price_list_id = dpl.price_list_id
          LEFT JOIN tastes t ON t.tastes_id = (
            SELECT ct.tastes_id
            FROM sostav_desserts sd
            JOIN category_tastes ct ON ct.inredients_id = sd.inredients_id
            WHERE sd.des_id = d.des_id
            LIMIT 1
          )
          WHERE d.des_id = $1;`,
        [id]
      );
      res.json(desert.rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving des", error });
    }
  }

  async getPrices(req, res) {
    try {
      const id = req.params.id;
      const { rows } = await db.query(
        "SELECT pl.weight, pl.price " +
          "FROM dessert_price_list dpl " +
          "JOIN price_list pl ON dpl.price_list_id = pl.price_list_id " +
          "WHERE dpl.des_id = $1 " +
          "ORDER BY pl.weight ASC;",
        [id]
      );
      res.json(rows);
    } catch (error) {
      console.error("Error fetching prices:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  async getPriceList(req, res) {
    try {
      const result = await db.query("SELECT * FROM price_list");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Ошибка получения прайс-листа" });
    }
  }

  async getFavorites(req, res) {
    try {
      const rawId = req.query.customersId;
      const customersId = rawId && !isNaN(rawId) ? parseInt(rawId) : null;

      const hasCustomerId = customersId !== null;

      const query = `
      SELECT f.favor_id, f.des_id, d.des_name, pl.weight, pl.price, d.photo
      FROM favourites f
      LEFT JOIN desserts d ON d.des_id = f.des_id
      LEFT JOIN dessert_price_list dpl ON dpl.des_id = d.des_id
      LEFT JOIN price_list pl ON pl.price_list_id = dpl.price_list_id
      WHERE pl.weight = (
        SELECT MIN(pl2.weight)
        FROM dessert_price_list dpl2
        JOIN price_list pl2 ON pl2.price_list_id = dpl2.price_list_id
        WHERE dpl2.des_id = d.des_id
      )
      ${hasCustomerId ? "AND f.cus_id = $1" : "AND f.cus_id IS NULL"}
      ORDER BY f.favor_id ASC;
    `;

      const result = await db.query(query, hasCustomerId ? [customersId] : []);
      return res.json(result.rows);
    } catch (error) {
      console.error("Ошибка при получении избранного:", error);
      res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
  }

  async addFavorites(req, res) {
    try {
      const { desertId, customersId } = req.body;
      const existing = await db.query(
        "SELECT * FROM favourites WHERE des_id = $1 AND cus_id = $2",
        [desertId, customersId]
      );
      if (existing.rows.length > 0) {
        return res.status(409).json({ message: "Десерт уже в избранном" });
      }
      const newFavor = await db.query(
        "INSERT INTO public.favourites(des_id, cus_id) VALUES ($1, $2) RETURNING *",
        [desertId, customersId]
      );
      return res.status(201).json(newFavor.rows[0]);
    } catch (error) {
      console.error("Ошибка при добавлении в избранное:", error);
      res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
  }

  async deleteFavorites(req, res) {
    try {
      const id = req.params.id;
      const favDel = await db.query(
        "DELETE FROM public.favourites WHERE favor_id = $1 RETURNING *",
        [id]
      );
      return res.json(favDel.rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving desert", error });
    }
  }

  async getBasket(req, res) {
    try {
      const rawId = req.query.customersId;
      const customersId = rawId && !isNaN(rawId) ? parseInt(rawId) : null;

      const hasCustomerId = customersId !== null;
      const query = `
      SELECT 
      bas.bas_id, 
      bas.des_id, 
      bas.quantity_des, 
      bas.final_weight, 
      bas.sum_price_list,
      d.des_name, 
      pl.weight, 
      pl.price, 
      d.photo
      FROM baskets bas
      LEFT JOIN desserts d ON d.des_id = bas.des_id
      LEFT JOIN dessert_price_list dpl ON dpl.des_id = d.des_id
      LEFT JOIN price_list pl ON pl.price_list_id = dpl.price_list_id
      WHERE pl.weight = (
        SELECT MIN(pl2.weight)
        FROM dessert_price_list dpl2
        JOIN price_list pl2 ON pl2.price_list_id = dpl2.price_list_id
        WHERE dpl2.des_id = d.des_id
      )
      ${hasCustomerId ? "AND bas.cus_id = $1" : "AND bas.cus_id IS NULL"}
      ORDER BY bas.bas_id ASC;
      `;
      console.log("Ответ с сервера baskets:", res.data);

      const result = await db.query(query, hasCustomerId ? [customersId] : []);
      return res.json(result.rows);
    } catch (error) {
      console.error("Ошибка при получении корзины:", error);
      res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
  }

  async addBasket(req, res) {
    try {
      const { desertId, finalWeight, sumPriceList, quantityDes, customersId } =
        req.body;

      const newBask = await db.query(
        `INSERT INTO baskets (des_id, final_weight, sum_price_list, quantity_des, cus_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
        [desertId, finalWeight, sumPriceList, quantityDes, customersId]
      );

      return res.json(newBask.rows[0]);
    } catch (error) {
      res.status(500).json({ message: "Error adding to basket", error });
    }
  }

  async updateBasket(req, res) {
    try {
      const { basketId, finalWeight, quantityDes, sumPriceList } = req.body;
      const updatedBasket = await db.query(
        `UPDATE public.baskets
         SET final_weight = $1,
             quantity_des = $2,
             sum_price_list = $3
         WHERE bas_id = $4
         RETURNING *;`,
        [finalWeight, quantityDes, sumPriceList, basketId]
      );
      return res.json(updatedBasket.rows[0]);
    } catch (error) {
      console.error("Error updating basket:", error);
      res.status(500).json({ message: "Error updating basket", error });
    }
  }

  async updateBasketId(req, res) {
    try {
      const id = req.params.id;
      const { desertId, finalWeight, quantityDes, sumPriceList } = req.body;

      const result = await db.query(
        "UPDATE baskets SET des_id = $1, final_weight = $2, quantity_des = $3, sum_price_list = $4 WHERE bas_id = $5 RETURNING *",
        [desertId, finalWeight, quantityDes, sumPriceList, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "Basket item not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Ошибка при обновлении корзины:", error);
      res.status(500).json({ message: "Ошибка при обновлении корзины", error });
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

  async addDessert(req, res) {
    try {
      const {
        title,
        categoryId,
        protein,
        fast,
        carbohydrates,
        calories,
        description,
        weight,
        price,
        structure,
        tasteId,
      } = req.body;

      const des_name = title?.trim();
      const existingDessert = await db.query(
        `SELECT des_id FROM desserts WHERE des_name = $1`,
        [des_name]
      );

      if (existingDessert.rows.length > 0) {
        return res.status(409).json({
          message: "Десерт с таким названием уже существует",
        });
      }

      const categ_des_id = Number(categoryId);
      const tastes_id = Number(tasteId);

      let photo = req.body.photo || "";
      if (photo) {
        photo = `..\\..\\photo\\${photo}`;
      }

      const getOrCreateId = async (table, column, value, idColumn) => {
        if (typeof value !== "string" || !value.trim()) return null;
        const trimmed = value.trim();
        const existing = await db.query(
          `SELECT ${idColumn} FROM ${table} WHERE ${column} = $1`,
          [trimmed]
        );
        if (existing.rows.length > 0) return existing.rows[0][idColumn];
        const inserted = await db.query(
          `INSERT INTO ${table} (${column}) VALUES ($1) RETURNING ${idColumn}`,
          [trimmed]
        );
        return inserted.rows[0][idColumn];
      };

      const nutValResult = await db.query(
        `INSERT INTO nutritional_value (protein, fast, carbohydrates, calories)
       VALUES ($1, $2, $3, $4) RETURNING nut_val_id`,
        [protein, fast, carbohydrates, calories]
      );
      const nut_val_id = nutValResult.rows[0].nut_val_id;

      const dessertResult = await db.query(
        `INSERT INTO desserts (des_name, categ_des_id, nut_val_id, photo, description)
       VALUES ($1, $2, $3, $4, $5) RETURNING des_id`,
        [des_name, categ_des_id, nut_val_id, photo, description]
      );
      const des_id = dessertResult.rows[0].des_id;

      // Выбор набора из price_list по весу 1.0 или 2.0
      let weightGroup = null;
      if (categ_des_id === 1) {
        // ТОЛЬКО для Тортов
        if (Number(weight) === 1.0) {
          weightGroup = [1, 2, 3, 4, 5, 6, 7];
        } else if (Number(weight) === 2.0) {
          weightGroup = [9, 10, 11, 12, 13];
        } else {
          return res
            .status(400)
            .json({ message: "Неподдерживаемый вес для категории Торт" });
        }

        for (const price_list_id of weightGroup) {
          await db.query(
            `INSERT INTO dessert_price_list (des_id, price_list_id) VALUES ($1, $2)`,
            [des_id, price_list_id]
          );
        }
      } else {
        // Не торт — обычный десерт, добавляем отдельную price_list
        const priceRes = await db.query(
          `INSERT INTO price_list (weight, price) VALUES ($1, $2) RETURNING price_list_id`,
          [weight, price]
        );
        const price_list_id = priceRes.rows[0].price_list_id;

        await db.query(
          `INSERT INTO dessert_price_list (des_id, price_list_id) VALUES ($1, $2)`,
          [des_id, price_list_id]
        );
      }

      const ingredients = [
        ...new Set(
          (structure || "")
            .split(",")
            .map((el) => el.trim())
            .filter((el) => el.length > 0)
        ),
      ];

      const tasteKeywords = [
        "клубника",
        "манго",
        "шоколад",
        "орехи",
        "малина",
        "кофе",
      ];

      for (let ingName of ingredients) {
        const inredients_id = await getOrCreateId(
          "inredients",
          "inredient_name",
          ingName,
          "inredients_id"
        );

        await db.query(
          `INSERT INTO sostav_desserts (des_id, inredients_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [des_id, inredients_id]
        );

        const matchesTaste = tasteKeywords.some((taste) =>
          ingName.toLowerCase().includes(taste)
        );

        if (tastes_id && matchesTaste) {
          await db.query(
            `INSERT INTO category_tastes (tastes_id, inredients_id)
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [tastes_id, inredients_id]
          );
        }
      }

      res.status(201).json({ message: "Десерт успешно добавлен", des_id });
    } catch (error) {
      console.error("Ошибка при добавлении десерта:", error);
      res.status(500).json({
        message: "Ошибка на сервере",
        details: error.message,
      });
    }
  }

  async updateDessert(req, res) {
    try {
      const { id } = req.params;
      const {
        title,
        categoryId,
        protein,
        fast,
        carbohydrates,
        calories,
        description,
        weight,
        price,
        structure,
        tasteId,
      } = req.body;

      let photo = req.body.photo || "";
      if (photo) {
        photo = `..\\..\\photo\\${photo}`;
      }

      const getOrCreateId = async (table, column, value, idColumn) => {
        if (typeof value !== "string" || !value.trim()) return null;
        const trimmed = value.trim();

        const existing = await db.query(
          `SELECT ${idColumn} FROM ${table} WHERE ${column} = $1`,
          [trimmed]
        );
        if (existing.rows.length > 0) return existing.rows[0][idColumn];

        const inserted = await db.query(
          `INSERT INTO ${table} (${column}) VALUES ($1) RETURNING ${idColumn}`,
          [trimmed]
        );
        return inserted.rows[0][idColumn];
      };

      const nutValRes = await db.query(
        `SELECT nut_val_id FROM desserts WHERE des_id = $1`,
        [id]
      );
      if (nutValRes.rows.length === 0) {
        return res.status(404).json({ message: "Десерт не найден" });
      }

      const nut_val_id = nutValRes.rows[0].nut_val_id;

      // Обновляем nutritional_value
      await db.query(
        `UPDATE nutritional_value SET protein = $1, fast = $2, carbohydrates = $3, calories = $4 WHERE nut_val_id = $5`,
        [protein, fast, carbohydrates, calories, nut_val_id]
      );

      // Обновляем desserts
      await db.query(
        `UPDATE desserts SET des_name = $1, categ_des_id = $2, photo = $3, description = $4 WHERE des_id = $5`,
        [title?.trim(), Number(categoryId), photo, description, id]
      );

      // Обновляем цены
      await db.query(`DELETE FROM dessert_price_list WHERE des_id = $1`, [id]);

      let weightGroup = null;

      if (Number(categoryId) === 1) {
        // Торт — удаляем старые связи и добавляем новые
        await db.query(`DELETE FROM dessert_price_list WHERE des_id = $1`, [
          id,
        ]);

        let weightGroup = null;

        if (Number(weight) === 1.0) {
          weightGroup = [1, 2, 3, 4, 5, 6, 7];
        } else if (Number(weight) === 2.0) {
          weightGroup = [9, 10, 11, 12, 13];
        }
        if (!weightGroup) {
          return res
            .status(400)
            .json({ message: "Неподдерживаемый вес для категории Торт" });
        }
        for (const price_list_id of weightGroup) {
          await db.query(
            `INSERT INTO dessert_price_list (des_id, price_list_id) VALUES ($1, $2)`,
            [id, price_list_id]
          );
        }
      } else {
        const priceListRes = await db.query(
          `SELECT price_list_id FROM dessert_price_list WHERE des_id = $1 LIMIT 1`,
          [id]
        );
        if (priceListRes.rows.length > 0) {
          const price_list_id = priceListRes.rows[0].price_list_id;

          await db.query(
            `UPDATE price_list SET weight = $1, price = $2 WHERE price_list_id = $3`,
            [weight, price, price_list_id]
          );
        } else {
          const insertPrice = await db.query(
            `INSERT INTO price_list (weight, price) VALUES ($1, $2) RETURNING price_list_id`,
            [weight, price]
          );

          const newPriceListId = insertPrice.rows[0].price_list_id;

          await db.query(
            `INSERT INTO dessert_price_list (des_id, price_list_id) VALUES ($1, $2)`,
            [id, newPriceListId]
          );
        }
      }

      const ingredients = [
        ...new Set(
          (structure || "")
            .split(",")
            .map((el) => el.trim())
            .filter((el) => el.length > 0)
        ),
      ];

      const tasteKeywords = [
        "клубника",
        "манго",
        "шоколад",
        "орехи",
        "малина",
        "кофе",
      ];

      for (const ingName of ingredients) {
        const inredients_id = await getOrCreateId(
          "inredients",
          "inredient_name",
          ingName,
          "inredients_id"
        );

        await db.query(
          `INSERT INTO sostav_desserts (des_id, inredients_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [id, inredients_id]
        );

        const matchesTaste = tasteKeywords.some((taste) =>
          ingName.toLowerCase().includes(taste)
        );

        if (tasteId && matchesTaste) {
          await db.query(
            `INSERT INTO category_tastes (tastes_id, inredients_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [tasteId, inredients_id]
          );
        }
      }

      res.status(200).json({ message: "Десерт успешно обновлён", des_id: id });
    } catch (error) {
      console.error("Ошибка при обновлении десерта:", error.message);
      console.error("Стек:", error.stack);
      res
        .status(500)
        .json({ message: "Ошибка на сервере", details: error.message });
    }
  }

  async deleteDessert(req, res) {
    const dessertId = req.params.id;
    const client = await db.connect(); 

    try {
      await client.query("BEGIN");

      
      await client.query("DELETE FROM sostav_desserts WHERE des_id = $1", [
        dessertId,
      ]);
      await client.query("DELETE FROM dessert_price_list WHERE des_id = $1", [
        dessertId,
      ]);

      
      await client.query("DELETE FROM desserts WHERE des_id = $1", [dessertId]);

      await client.query("COMMIT");
      res.status(200).json({ message: "Десерт успешно удалён" });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Ошибка при удалении десерта:", error);
      res.status(500).json({ error: "Не удалось удалить десерт" });
    } finally {
      client.release();
    }
  }
}

module.exports = new DesControllers();
