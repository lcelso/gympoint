import * as Yup from 'yup';

import HelpOrders from '../schemas/HelpOrders';
import Student from '../models/Student';
import Enrollment from '../models/Enrollment';
import Queue from '../../lib/Queue';
import HelpOrdersQuestionMail from '../jobs/HelpOrdersQuestionMail';
import HelpOrdersAnswerMail from '../jobs/HelpOrdersAnswerMail';

class HelpOrdersController {
  async index(req, res) {
    const helpOrder = await HelpOrders.find({ read: false });

    return res.json(helpOrder);
  }

  async store(req, res) {
    const schemasHelpOrders = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schemasHelpOrders.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { student_id } = req.params;
    const student = await Student.findByPk(student_id);
    const enrollment = await Enrollment.findOne({
      where: { student_id },
    });

    if (!student) {
      return res.status(400).json({
        error: 'Student does not exist.',
        message: 'O Aluno não existe',
      });
    }

    if (!enrollment) {
      return res.status(400).json({
        error: 'Student does not includ in Plan.',
        message: 'O aluno não tem vinculo com nenhum plano ainda.',
      });
    }

    const { question } = req.body;
    const helpOrders = await HelpOrders.create({
      student_id,
      question,
    });

    await Queue.add(HelpOrdersQuestionMail.key, {
      studentName: student.name,
      studentEmail: student.email,
      question: question,
    });

    return res.json(helpOrders);
  }

  async update(req, res) {
    const schemasHelpOrders = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schemasHelpOrders.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const helpOrder = await HelpOrders.findById(req.params.help_order_id);

    if (!helpOrder) {
      return res.json({
        error: 'The id entered does not exist.',
        message: 'O id informado não existe.'
      })
    }

    const { answer } = req.body;
    const helpOrderUpdate = await HelpOrders.findByIdAndUpdate(
      req.params.help_order_id,
      {
        answer: answer,
        answer_at: new Date(),
        read: true,
      },
      { new: true }
    );

    const student = await Student.findByPk(helpOrder.student_id);
    await Queue.add(HelpOrdersAnswerMail.key, {
      studentName: student.name,
      studentEmail: student.email,
      question: helpOrder.question,
      answer: answer,
    });

    return res.json(helpOrderUpdate);
  }

  async show(req, res) {
    const helpOrder = await HelpOrders.find({ student_id: req.params.student_id });

    return res.json(helpOrder);
  }
}

export default new HelpOrdersController();
