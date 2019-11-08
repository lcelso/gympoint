import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll();

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

    const planExists = await Plan.findOne({
      where: { title: req.body.title },
    });

    if (planExists) {
      return res.status(400).json({ error: 'Plans already exists.' });
    }

    const { id, title, duration, price } = await Plan.create(req.body);

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

    const { planId } = req.params;
    const { title, duration } = req.body;
    const monthYear = 12;

    if (duration > monthYear) {
      return res.status(400).json({
        error: `Plan duration must be less than or equal to ${monthYear}`,
      });
    }

    const plan = await Plan.findByPk(planId);

    if (title !== plan.title) {
      const planExist = await Plan.findOne({ where: { title } });

      if (planExist) {
        return res.status(400).json({ error: 'Plan already exists.' });
      }
    }

    const planUpdate = await plan.update(req.body);
    return res.json(planUpdate);
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.planId);

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    Plan.destroy({ where: { id: plan.planId } });
    return res.json({ message: `Plan ${plan.title} was deleted` });
  }
}

export default new PlanController();
