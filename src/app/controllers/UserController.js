import * as Yup from 'yup';

import User from '../models/User';

class UserController {
  async index(req, res) {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User does not exist.' });
    }

    return res.json({
      id: user.id,
      name: user.name,
      email,
    });
  }

  async store(req, res) {
    const { email } = req.body;
    const schemaUser = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    if (!(await schemaUser.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails.' });
    }

    const user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
    });
  }

  async update(req, res) {
    const schemaUser = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    const { email, password, oldPassword, confirmPassword } = req.body;
    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExist = await User.findOne({ where: { email } });

      if (userExist) {
        return res.status(400).json({ error: 'User already exists.' });
      }
      return res.status(400).json({ error: 'User does not exist.' });
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match.' });
    }

    if (confirmPassword !== password) {
      return res.status(401).json({ error: 'New password does not match.' });
    }

    if (!(await schemaUser.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails.' });
    }

    const { id, name } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      password,
    });
  }

  async delete(req, res) {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User does not exist.' });
    }

    // eslint-disable-next-line consistent-return
    return User.destroy({ where: { id: user.id } }).then(response => {
      if (response === 1) {
        res
          .status(200)
          .json({ message: 'User deleted successfully.' })
          .end();
      } else {
        res.status(400).json('User not deleted error');
      }
    });
  }
}

export default new UserController();
