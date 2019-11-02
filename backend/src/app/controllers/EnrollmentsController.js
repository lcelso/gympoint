import * as Yup from 'yup';
import { parseISO, isBefore, addMonths } from 'date-fns';
import currencyFormatter from 'currency-formatter';

import Enrollments from '../models/Enrollments';
import Plans from '../models/Plans';
import Students from '../models/Students';

import WelcomeMail from '../jobs/WelcomeMail';
import Queue from '../../lib/Queue';

class EnrollmentsController {
  async store(req, res) {
    const schemasEnrollments = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schemasEnrollments.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id, plan_id, start_date } = req.body;
    const plan = await Plans.findByPk(plan_id);
    const student = await Students.findByPk(student_id);
    const enrollments = await Enrollments.findOne({
      where: {
        student_id,
      },
    });

    if (isBefore(parseISO(start_date), new Date())) {
      return res.status(400).json({ error: 'Invalid old dates.' });
    }

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist.' });
    }

    if (enrollments) {
      if (enrollments.student_id === student_id) {
        return res
          .status(400)
          .json({ error: 'Student is already registered.' });
      }
    }

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist.' });
    }

    const { duration, price } = plan;
    const totalPrice = price * duration;
    const end_date = addMonths(parseISO(start_date), duration);

    const enrollment = await Enrollments.create({
      ...req.body,
      price: totalPrice,
      end_date,
    });

    await Queue.add(WelcomeMail.key, {
      studentName: student.name,
      studentEmail: student.email,
      start_date,
      end_date,
      planTitle: plan.title,
      priceMonth: currencyFormatter.format(price, { code: 'BRL' }),
      totalPrice: currencyFormatter.format(totalPrice, { code: 'BRL' }),
    });

    res.json(enrollment);
  }
}

export default new EnrollmentsController();
