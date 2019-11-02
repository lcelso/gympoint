import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class WelcomeMail {
  get key() {
    return 'WelcomeMail';
  }

  async handle({ data }) {
    const {
      studentName,
      studentEmail,
      start_date,
      end_date,
      planTitle,
      priceMonth,
      totalPrice,
    } = data;

    await Mail.sendMail({
      to: studentEmail,
      subject: `Matrícula concluída`,
      template: 'welcome',
      context: {
        student: studentName,
        plan: planTitle,
        start: format(parseISO(start_date), "'Dia' dd 'de' MMMM' de 'yyyy", {
          locale: pt,
        }),
        end: format(parseISO(end_date), "'Dia' dd 'de' MMMM' de 'yyyy", {
          locale: pt,
        }),
        price: priceMonth,
        total: totalPrice,
      },
    });
  }
}

export default new WelcomeMail();
