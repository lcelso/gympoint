import Mail from '../../lib/Mail';

class HelpOrdersQuestionMail {
  get key() {
    return 'HelpOrdersQuestionMail';
  }

  async handle({ data }) {
    const {
      studentName,
      studentEmail,
      question,
    } = data;

    await Mail.sendMail({
      to: studentEmail,
      subject: `Pedido de auxilio`,
      template: 'helpOrdersQuestion',
      context: {
        student: studentName,
        question: question,
      },
    });
  }
}

export default new HelpOrdersQuestionMail();
