import * as Yup from 'yup';
import Student from '../models/Student';
import File from '../models/File';

class StudentController {
  async index(req, res) {
    const students = await Student.findAll({
      attributes: ['id', 'name', 'email', 'age', 'tall', 'weight', 'avatar_id'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['path', 'url'],
        },
      ],
    });
    return res.json(students);
  }

  async store(req, res) {
    const { email } = req.body;
    const schemaStudents = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      tall: Yup.number().required(),
      weight: Yup.number().required(),
    });

    if (!(await schemaStudents.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails.' });
    }

    const student = await Student.findOne({ where: { email } });
    if (student) {
      return res.status(400).json({ error: 'Students already exists.' });
    }

    const { name, age, weight, tall } = await Student.create(req.body);

    return res.json({
      name,
      email,
      age,
      tall,
      weight,
    });
  }

  async update(req, res) {
    const schemaStudents = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number().required(),
      tall: Yup.number().required(),
      weight: Yup.number().required(),
    });

    if (!(await schemaStudents.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails.' });
    }

    const { studentId } = req.params;
    const { email } = req.body;

    const student = await Student.findByPk(studentId);
    if (!student) return res.status(400).json({ error: 'Id does not exists.' });

    if (email !== student.email) {
      const studentExist = await Student.findOne({ where: { email } });

      if (studentExist) {
        return res.status(400).json({ error: 'Student already exists.' });
      }
    }

    const studentUpdate = await student.update(req.body);
    return res.json(studentUpdate);
  }

  async delete(req, res) {
    const student = await Student.findByPk(req.params.studentId);

    if (!student) {
      return res.status(400).json({ error: 'Invalid student' });
    }

    Student.destroy({ where: { id: student.studentId } });
    return res.json({ message: `Plan ${student.name} was deleted` });
  }
}

export default new StudentController();
