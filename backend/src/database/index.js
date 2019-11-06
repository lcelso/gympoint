import Sequelize from 'sequelize';

import User from '../app/models/User';
import Students from '../app/models/Students';
import Plans from '../app/models/Plans';
import File from '../app/models/File';
import Enrollments from '../app/models/Enrollments';
import Checkins from '../app/models/Checkins';

import databaseConfig from '../config/database';

const models = [User, Students, Plans, File, Enrollments, Checkins];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
