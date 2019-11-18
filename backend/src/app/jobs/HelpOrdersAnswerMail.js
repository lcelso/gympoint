import Mail from '../../lib/Mail';

class HelpOrdersAnswerMail {
  get key() {
    return 'HelpOrdersAnswerMail';
  }

  async handle({ data }) {
    const {
      studentName,
      studentEmail,
      question,
      answer,
    } = data;

    await Mail.sendMail({
      to: studentEmail,
      subject: `Pedido de auxilio respondido`,
      template: 'HelpOrdersAnswer',
      context: {
        student: studentName,
        question: question,
        answer: answer,
      },
    });
  }
}

export default new HelpOrdersAnswerMail();
