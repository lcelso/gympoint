import * as Yup from 'yup';
import Students from '../models/Students';

class StudentsController {
  async index(req, res) {
    const students = await Students.findAll();
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

    const students = await Students.findOne({ where: { email } });
    if (students) {
      return res.status(400).json({ error: 'Students already exists.' });
    }

    const { name, age, weight, tall } = await Students.create(req.body);

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

    const { id } = req.params;
    const { email } = req.body;

    const students = await Students.findByPk(id);

    if (email !== students.email) {
      const studentsExist = await Students.findOne({ where: { email } });

      if (studentsExist) {
        return res.status(400).json({ error: 'Student already exists.' });
      }
    }

    const student = await students.update(req.body);
    return res.json(student);
  }

  async delete(req, res) {
    const student = await Students.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Invalid student' });
    }

    Students.destroy({ where: { id: student.id } });
    return res.json({ message: `Plan ${student.name} was deleted` });
  }
}

export default new StudentsController();
