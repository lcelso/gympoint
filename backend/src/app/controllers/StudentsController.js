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

    const { id } = req.params;
    const { email } = req.body;

    const students = await Students.findByPk(id);

    if (email !== students.email) {
      const studentsExist = await Students.findOne({ where: { email } });

      if (studentsExist) {
        return res.status(400).json({ error: 'Student already exists.' });
      }
    }

    if (!(await schemaStudents.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails.' });
    }

    const student = await students.update(req.body);
    return res.json(student);
  }

  async delete(req, res) {
    const { id } = req.params;
    const student = await Students.findOne({ where: { id } });

    return Students.destroy({ where: { id: student.id } }).then(response => {
      if (response === 1) {
        res
          .status(200)
          .json({ message: 'Student deleted successfully.' })
          .end();
      } else {
        res.status(400).json('Student not deleted error');
      }
    });
  }
}

export default new StudentsController();
