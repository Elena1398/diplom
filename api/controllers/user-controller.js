const db = require("../db");

class UsControllers {
  async loginUser(req, res) {
    try {
      const { login, passwords } = req.body;

      // SQL-запрос на поиск пользователя по логину и паролю
      const query = `
           SELECT * FROM public.customers 
           WHERE login = $1 AND passwords = crypt($2, passwords)`;
      const values = [login, passwords];

      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Неверный логин или пароль" });
      }

      const cus = result.rows[0];
      return res.status(200).json({ message: "Авторизация успешна", cus });
    } catch (error) {
      console.error("Ошибка при авторизации пользователя:", error);
      res.status(500).json({ message: "Ошибка при авторизации", error });
    }
  }
  async registrationUser(req, res) {
    try {
      const {
        surname,
        name,
        patronymic,
        birthday,
        email,
        login,
        passwords,
        adress,
      } = req.body;

      // 1. Вставка в таблицу customers
      const insertCustomer = `
       INSERT INTO public.customers(login, passwords)
       VALUES ($1, crypt($2, gen_salt('bf')))
       RETURNING cus_id;`;
      const resultCustomer = await db.query(insertCustomer, [login, passwords]);
      const cus_id = resultCustomer.rows[0].cus_id;
      const customersId = cus_id;

      // 2. Вставка в таблицу customer_info
      const insertInfo = `
        INSERT INTO public.customer_info(
          cus_id, cus_surname, cus_name, cus_patronymic, cus_birthday, cus_email, cus_adress)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      await db.query(insertInfo, [
        customersId,
        surname,
        name,
        patronymic || null,
        birthday,
        email,
        adress,
      ]);

      // 3. Получение всех данных пользователя (JOIN)
      const resultInfo = await db.query(
        `
        SELECT 
          c.cus_id,
          c.login,
          ci.cus_surname,
          ci.cus_name,
          ci.cus_patronymic,
          ci.cus_birthday,
          ci.cus_email,
          ci.cus_adress
        FROM public.customers c
        JOIN public.customer_info ci ON c.cus_id = ci.cus_id
        WHERE c.cus_id = $1
      `,
        [customersId]
      );

      const cus = resultInfo.rows[0];
      return res
        .status(200)
        .json({ message: "Регистрация прошла успешно", cus });
    } catch (error) {
      console.error("Ошибка при регистрации пользователя:", error);
      res.status(500).json({ message: "Ошибка при регистрации", error });
    }
  }
  async getcocustomersId(req, res) {
    try {
      const customersId = req.params.id;

      const query = `
      SELECT 
      c.cus_id, i.cus_surname, i.cus_name, i.cus_patronymic,  
      TO_CHAR(i.cus_birthday, 'YYYY-MM-DD') as date_of_birthday, i.cus_email, c.login, i.cus_adress
      FROM public.customers c
      JOIN public.customer_info i ON c.cus_id = i.cus_id
      WHERE c.cus_id = $1;`;

      const result = await db.query(query, [customersId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Пользователь не найден" });
      }

      const user = result.rows[0];
      res.status(200).json(user);
    } catch (error) {
      console.error("Ошибка при получении данных пользователя:", error);
      res
        .status(500)
        .json({ message: "Ошибка при получении данных пользователя", error });
    }
  }
  async updateUser(req, res) {
    try {
      const cus_id = req.params.id;
      const { surname, name, patronymic, birthday, email, login, adress } =
        req.body;

      // Обновление таблицы customers
      const updateCustomer = `
        UPDATE public.customers
        SET login = $1
        WHERE cus_id = $2;
      `;
      await db.query(updateCustomer, [login, cus_id]);

      // Обновление таблицы customer_info
      const updateInfo = `
        UPDATE public.customer_info
        SET cus_surname = $1,
            cus_name = $2,
            cus_patronymic = $3,
            cus_birthday = $4,
            cus_email = $5,
            cus_adress = $6
        WHERE cus_id = $7;
      `;
      await db.query(updateInfo, [
        surname,
        name,
        patronymic || null,
        birthday,
        email,
        adress,
        cus_id,
      ]);

      res.status(200).json({ message: "Данные успешно обновлены" });
    } catch (error) {
      console.error("Ошибка при обновлении данных пользователя:", error);
      res.status(500).json({ message: "Ошибка при обновлении данных", error });
    }
  }
  async changePassword(req, res) {
    try {
      const { userId, oldPassword, newPassword } = req.body;

      // 1. Проверка, существует ли пользователь и совпадает ли старый пароль
      const checkUserQuery = `
        SELECT * FROM public.customers 
        WHERE cus_id = $1 AND passwords = crypt($2, passwords);
      `;
      const userResult = await db.query(checkUserQuery, [userId, oldPassword]);

      if (userResult.rows.length === 0) {
        return res.status(401).json({ message: "Старый пароль неверен" });
      }

      // 2. Обновление пароля
      const updateQuery = `
        UPDATE public.customers
        SET passwords = crypt($1, gen_salt('bf'))
        WHERE cus_id = $2;
      `;
      await db.query(updateQuery, [newPassword, userId]);

      res.status(200).json({ message: "Пароль успешно изменён" });
    } catch (error) {
      console.error("Ошибка при смене пароля:", error);
      res.status(500).json({ message: "Ошибка при смене пароля", error });
    }
  }
  async createOrder(req, res) {
    try {
      const { cus_id, date, timeSlot, totalPrice } = req.body;

      // Получаем товары из корзины
      const basketItems = await db.query(
        `
  SELECT des_id, quantity_des, sum_price_list, final_weight
  FROM public.baskets
  WHERE cus_id = $1
`,
        [cus_id]
      );

      const items = basketItems.rows.map((item) => ({
        des_id: item.des_id,
        quantity: item.quantity_des,
        sum_price_list: item.sum_price_list,
        final_weight: item.final_weight,
      }));

      // Проверка обязательных полей
      if (
        !cus_id ||
        !date ||
        !timeSlot ||
        !totalPrice ||
        !items ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res
          .status(400)
          .json({ message: "Отсутствуют обязательные поля" });
      }

      // Выводим содержимое items для отладки
      console.log("Полученные товары:", items);

      // 1. Создание заказа
      const orderQuery = `
      INSERT INTO public.orders (cus_id, data_orders, time_orsers, summa)
      VALUES ($1, $2, $3, $4)
      RETURNING orders_id;
    `;
      const orderValues = [cus_id, date, timeSlot, totalPrice];
      const result = await db.query(orderQuery, orderValues);
      const orderId = result.rows[0].orders_id;

      // 2. Вставка товаров с учетом final_weight
      const valuePlaceholders = items
        .map((_, i) => {
          const base = i * 5;
          return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${
            base + 5
          })`;
        })
        .join(", ");

      const values = items.flatMap((item, index) => {
        // Проверка final_weight — вывод в консоль
        if (item.final_weight === undefined || item.final_weight === null) {
          console.warn(
            `⚠️ final_weight отсутствует у item #${index + 1}`,
            item
          );
        }

        return [
          orderId,
          item.des_id,
          item.quantity || 1,
          item.final_weight || 0,
          item.sum_price_list,
        ];
      });

      const insertItemsQuery = `
      INSERT INTO public.order_items (orders_id, des_id, quantity, final_weight, sum_price_list)
      VALUES ${valuePlaceholders};
    `;
      await db.query(insertItemsQuery, values);

      res.status(200).json({
        message: "Заказ успешно создан",
        orderId,
      });
    } catch (error) {
      console.error("❌ Ошибка при создании заказа:", error);
      res.status(500).json({ message: "Ошибка при создании заказа", error });
    }
  }
  async getOrdersByCustomer(req, res) {
    try {
      const cus_id = req.params.id;
      if (!cus_id)
        return res.status(400).json({ message: "Не передан ID пользователя" });

      // 1. Получаем все заказы пользователя
      const ordersQuery = `
      SELECT
        o.orders_id,
        o.data_orders,
        o.time_orsers,
        o.summa
      FROM public.orders o
      WHERE o.cus_id = $1
      ORDER BY o.data_orders DESC, o.time_orsers DESC;
    `;
      const ordersResult = await db.query(ordersQuery, [cus_id]);
      const orders = ordersResult.rows;

      if (orders.length === 0) return res.json([]);

      // 2. Получаем товары для всех заказов, с заменой null final_weight на 0
      const ordersIds = orders.map((o) => o.orders_id);

      const itemsQuery = `
      SELECT
        oi.order_items_id,
        oi.orders_id,
        oi.des_id,
        oi.quantity,
        oi.sum_price_list,
        COALESCE(oi.final_weight, 0) AS final_weight,
        d.des_name,
        d.photo,
        pl.price
      FROM public.order_items oi
      JOIN public.desserts d ON oi.des_id = d.des_id
      LEFT JOIN dessert_price_list dpl ON dpl.des_id = d.des_id
      LEFT JOIN price_list pl ON pl.price_list_id = dpl.price_list_id
      WHERE oi.orders_id = ANY($1)
        AND pl.weight = (
          SELECT MIN(pl2.weight)
          FROM dessert_price_list dpl2
          JOIN price_list pl2 ON pl2.price_list_id = dpl2.price_list_id
          WHERE dpl2.des_id = d.des_id
        )
      ORDER BY oi.orders_id, oi.order_items_id;
    `;

      const itemsResult = await db.query(itemsQuery, [ordersIds]);

      // 3. Добавляем " кг" к весу final_weight
      const itemsWithWeight = itemsResult.rows.map((item) => ({
        ...item,
        final_weight: `${item.final_weight} кг`,
      }));

      // 4. Группируем товары по заказам
      const ordersWithItems = orders.map((order) => ({
        ...order,
        items: itemsWithWeight.filter(
          (item) => item.orders_id === order.orders_id
        ),
      }));

      res.json(ordersWithItems);
    } catch (error) {
      console.error("Ошибка получения заказов пользователя:", error);
      res.status(500).json({ message: "Ошибка сервера", error: error.message });
    }
  }
  async clearBasketByCustomer(req, res) {
  try {
    const { customersId } = req.body;

    await db.query(
      "DELETE FROM public.baskets WHERE cus_id = $1",
      [customersId]
    );

    res.json({ message: "Корзина очищена" });
  } catch (error) {
    console.error("Ошибка при очистке корзины:", error);
    res.status(500).json({ message: "Ошибка сервера", error: error.message });
  }
}

}
module.exports = new UsControllers();
