import * as Yup from 'yup';
import { parseISO } from 'date-fns';

class CheckinsController {
  async store(req, res) {
    return res.json('create');
  }
}

export default new CheckinsController();
