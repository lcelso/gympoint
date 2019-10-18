import User from '../models/User';

class UserController {
  async index(req, res) {
    const { email } = req.body;

    const { id, name } = await User.findOne({ where: { email } });

    return res.json({
      id,
      name,
      email,
    });
  }

  async store(req, res) {
    const { email } = req.body;
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
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User does not exist.' });
    }

    const { id, name, password } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      password,
    });
  }

  async delete(req, res) {
    const { email } = req.body;
    const { id } = await User.findOne({ where: { email } });

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ error: 'User does not exist.' });
    }

    // eslint-disable-next-line consistent-return
    User.destroy({ where: { id } }).then(response => {
      if (response === 1) {
        return res.status(200).json({ message: 'User deleted successfully.' });
      }
    });
    return res.status(400).json('User not deleted error');
  }
}

export default new UserController();
