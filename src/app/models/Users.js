import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class Users extends Model {
  static init(sequelize) {
    super.init(
      {
        role_id: Sequelize.INTEGER,
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        // A propriedade VIRTUAL é usada temporariamente e sua informação não é lançada no db
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        deleted_at: Sequelize.DATE,
        deleted_by: Sequelize.INTEGER,
      },
      { sequelize }
    );

    // Esta função addHook é usada para executar um código em determinado momento.
    // Neste caso, "antes de salvar" as informações no banco de dados criptogtafamos a senha.
    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        // Na função hash do bycript, o primeiro segundo argumento indica a força da criptografia.
        // O número 8 é razoável, números maiores deixariam a aplicação lenta.
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  verifyPassword(password) {
    // A função "compare" retorna true se a senha informada corresponde à senha criptografada no db
    return bcrypt.compare(password, this.password_hash);
  }

  static associate(models) {
    // Um usuário só poderá ter um cargo
    this.belongsTo(models.Roles, { foreignKey: 'role_id', as: 'role' });
    this.hasMany(models.Tasks);
  }
}

export default Users;
