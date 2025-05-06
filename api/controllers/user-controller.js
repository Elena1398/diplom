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
        surname, name, patronymic, birthday, email, login, passwords, adress,
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
      await db.query(updateInfo, [ surname, name, patronymic || null, birthday, email, adress, cus_id,
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
  
}

module.exports = new UsControllers();
