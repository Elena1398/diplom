const db = require("../db");

class UsControllers {
  async loginUser(req, res) {
    try {
      const { login, passwords } = req.body;

      // SQL-запрос на поиск пользователя по логину и паролю
      const query = `
            SELECT * FROM public.customers 
            WHERE login = $1 AND passwords = $2
          `;
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
        VALUES ($1, $2)
        RETURNING cus_id;
      `;
      const resultCustomer = await db.query(insertCustomer, [login, passwords]);
      const cus_id = resultCustomer.rows[0].cus_id;
  
      // 2. Вставка в таблицу customer_info
      const insertInfo = `
        INSERT INTO public.customer_info(
          cus_id, cus_surname, cus_name, cus_patronymic, cus_birthday, cus_email, cus_adress)
        VALUES ($1, $2, $3, $4, $5, $6, $7);
      `;
      await db.query(insertInfo, [
        cus_id,
        surname,
        name,
        patronymic || null,
        birthday,
        email,
        adress,
      ]);
  
      // 3. Получение всех данных пользователя (JOIN)
      const resultInfo = await db.query(`
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
      `, [cus_id]);
  
      const cus = resultInfo.rows[0];
      return res.status(200).json({ message: "Регистрация прошла успешно", cus });
  
    } catch (error) {
      console.error("Ошибка при регистрации пользователя:", error);
      res.status(500).json({ message: "Ошибка при регистрации", error });
    }
  }  
}

module.exports = new UsControllers();
