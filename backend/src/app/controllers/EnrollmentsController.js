import * as Yup from 'yup';
import {
  parseISO,
  isBefore,
  addMonths,
  format,
  formatDistance,
  isEqual,
  isSaturday,
  isSunday,
  addDays,
} from 'date-fns';
import pt from 'date-fns/locale/pt';

import currencyFormatter from 'currency-formatter';

import Enrollments from '../models/Enrollments';
import Plans from '../models/Plans';
import Students from '../models/Students';
import File from '../models/File';

import WelcomeMail from '../jobs/WelcomeMail';
import EnrollmentUpdate from '../jobs/EnrollmentUpdateMail';
import Queue from '../../lib/Queue';

class EnrollmentsController {
  async index(req, res) {
    const enrollments = await Enrollments.findAll({
      attributes: ['id', 'price', 'start_date', 'end_date'],
      include: [
        {
          model: Students,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'tall', 'weight'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['path', 'url'],
            },
          ],
        },
        {
          model: Plans,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });
    return res.json(enrollments);
  }

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

    return res.json(enrollment);
  }

  async update(req, res) {
    const schemasEnrollments = Yup.object().shape({
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schemasEnrollments.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Validation fails.', message: 'Data inválida' });
    }

    const { enrollmentId } = req.params;
    const { student_id, plan_id, start_date } = req.body;
    const student = await Students.findByPk(student_id);
    const updatePlan = await Plans.findByPk(plan_id);

    const enrollments = await Enrollments.findByPk(enrollmentId);
    if (!enrollments) {
      return res.status(400).json({
        error: 'The student did not register for enrollment.',
        message: 'O Aluno ainda não esta vinculado a nenhuma matrícula',
      });
    }

    if (!student) {
      return res.status(400).json({
        error: 'Student does not exist.',
        message: 'O Aluno não existe',
      });
    }

    if (!updatePlan) {
      return res.status(400).json({
        error: 'Plan does not existing.',
        message: 'O Plano informado não existe',
      });
    }

    if (isBefore(parseISO(start_date), new Date())) {
      return res.status(400).json({
        error: 'Invalid old dates.',
        message:
          'As datas informadas são anteriores ao dia de hoje, favor informar uma data valida.',
      });
    }

    const activePlan = await Plans.findByPk(enrollments.plan_id);
    const { title: activeTitle, duration: activeDuration } = activePlan;

    if (activeTitle !== 'Start') {
      let expectedDate = addMonths(enrollments.start_date, activeDuration / 2);
      const dateEsquals = isEqual(
        new Date().setHours(0),
        expectedDate.setHours(0)
      );

      if (!dateEsquals) {
        const date = formatDistance(new Date(), expectedDate, {
          locale: pt,
        });

        if (isSaturday(expectedDate)) {
          expectedDate = addDays(expectedDate, 2);
        }

        if (isSunday(expectedDate)) {
          expectedDate = addDays(expectedDate, 1);
        }

        const dateFull = format(expectedDate.getTime(), "'dia' dd 'de' MMMM'", {
          locale: pt,
        });

        return res.status(400).json({
          error: 'Plan did not reach 50% required.',
          message: `Você não pode alterar seu plano, pois não atingiu 50% do mesmo. Volte daqui ${date}, no ${dateFull}.`,
        });
      }
    }

    const { duration, price, title } = updatePlan;
    const totalPrice = price * duration;
    const end_date = addMonths(parseISO(start_date), duration);

    const enrollment = await enrollments.update({
      ...req.body,
      price: totalPrice,
      end_date,
    });

    await Queue.add(EnrollmentUpdate.key, {
      studentName: student.name,
      studentEmail: student.email,
      start_date,
      end_date,
      planTitle: title,
      priceMonth: currencyFormatter.format(price, { code: 'BRL' }),
      totalPrice: currencyFormatter.format(totalPrice, { code: 'BRL' }),
    });

    return res.json(enrollment);
  }

  async delete(req, res) {
    const enrollment = await Enrollments.findByPk(req.params.enrollmentId);

    if (!enrollment) {
      return res.status(400).json({ error: 'Invalid enrollment' });
    }

    Enrollments.destroy({ where: { id: req.params.enrollmentId } });
    return res.json({ message: `Enrollment ${enrollment.id} was deleted` });
  }
}

export default new EnrollmentsController();
