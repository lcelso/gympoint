import {
  isWithinInterval,
  subDays,
  startOfHour,
  format,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  addDays,
  isToday,
  getHours,
} from 'date-fns';
import pt from 'date-fns/locale/pt';

import Student from '../models/Student';
import Enrollment from '../models/Enrollment';
import CheckIn from '../schemas/CheckIn';

class CheckinsController {
  async index(req, res) {
    const { student_id } = req.params;
    const student = await Student.findByPk(student_id);

    if (!student) {
      return res.status(400).json({
        error: 'Student does not exist.',
        message: 'O Aluno não existe',
      });
    }

    const checkins = await CheckIn.find({
      student_id,
    });
    return res.json(checkins);
  }

  async store(req, res) {
    const { student_id } = req.params;
    const student = await Student.findByPk(student_id);
    const enrollment = await Enrollment.findOne({
      where: { student_id },
    });

    const [lastCheckin] = await CheckIn.find({ student_id }).sort({
      updatedAt: 'desc',
    });

    if (lastCheckin) {
      const { createdAt } = lastCheckin;
      const hourPermited = getHours(createdAt) + 5;
      const currentHour = getHours(new Date());
      const hoursWait = hourPermited - currentHour;

      if (hourPermited > currentHour) {
        return res
          .status(401)
          .json({ error: `You've to wait ${hoursWait} hours to next checkin` });
      }
    }

    /**
     * Verifica se o aluno existe
     */
    if (!student) {
      return res.status(400).json({
        error: 'Student does not exist.',
        message: 'O Aluno não existe',
      });
    }

    /**
     * Verifica se aluno esta vinculado a um plano
     */
    if (!enrollment) {
      return res.status(400).json({
        error: 'Student does not includ in Plan.',
        message: 'O aluno não tem vinculo com nenhum plano ainda.',
      });
    }

    /**
     * Verifica se o plano do aluno ainda esta valido.
     */
    const currentDay = startOfDay(new Date());
    const today = isToday(currentDay);
    const date = today ? addDays(currentDay, 1) : currentDay;

    const isPlanValid = isWithinInterval(date, {
      start: enrollment.start_date,
      end: enrollment.end_date,
    });

    if (!isPlanValid) {
      return res.status(401).json({
        error: 'Student plan not valid',
        message: 'Plano deste aluno já venceu.',
      });
    }

    /**
     * Verifica se o usuario realizou +2 checkins no dia e bloqueia
     */
    const checkInDay = 2;
    const countCheckInDay = await CheckIn.find({
      student_id,
    })
      .gte('createdAt', startOfDay(currentDay))
      .lte('createdAt', endOfDay(currentDay))
      .countDocuments();

    if (countCheckInDay >= checkInDay) {
      return res.status(400).json({
        error: 'daily limit exceeded',
        message: 'Límite diário excedido.',
      });
    }

    /**
     * Verifica quando checkins foram feitos dentro de 7 dias e bloqueia
     * quando atinge 5 dias.
     */
    const dateLimit = 5;
    const dateWeek = 7;

    const lastWeek = subDays(currentDay, dateWeek);
    const countCheckInWeek = await CheckIn.find({
      student_id,
    })
      .gt('createdAt', startOfWeek(lastWeek))
      .lt('createdAt', endOfWeek(currentDay))
      .countDocuments();

    if (countCheckInWeek === dateLimit) {
      return res.status(400).json({
        error: 'Limit execeeded',
        message:
          'Limite excedido, você pode realizar 5 check-ins dentro de 7 dias',
      });
    }

    const hourStart = startOfHour(currentDay);
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    );

    const checkin = await CheckIn.create({
      content: `Check-in feito por ${student.name}, no ${formattedDate} `,
      student_id,
    });

    return res.json(checkin);
  }
}

export default new CheckinsController();
