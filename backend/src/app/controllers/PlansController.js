import * as Yup from 'yup';
import Plans from '../models/Plans';

class PlansController {
  async index(req, res) {
    const plans = await Plans.findAll();

    return res.json(plans);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const plansExists = await Plans.findOne({
      where: { title: req.body.title },
    });

    if (plansExists) {
      return res.status(400).json({ error: 'Plans already exists.' });
    }

    const { id, title, duration, price } = await Plans.create(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number().required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { id } = req.params;
    const { title, duration } = req.body;

    if (duration > 12) {
      return res
        .status(400)
        .json({ error: 'Plan duration must be less than or equal to 12' });
    }

    const plans = await Plans.findByPk(id);

    if (title !== plans.title) {
      const planExist = await Plans.findOne({ where: { title } });

      if (planExist) {
        return res.status(400).json({ error: 'Plan already exists.' });
      }
    }

    const plan = await plans.update(req.body);
    return res.json(plan);
  }

  async delete(req, res) {
    const plan = await Plans.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    Plans.destroy({ where: { id: plan.id } });
    return res.json({ message: `Plan ${plan.title} was deleted` });
  }
}

export default new PlansController();
