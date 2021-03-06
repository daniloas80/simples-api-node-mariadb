/* eslint-disable no-case-declarations */
import { Op } from 'sequelize';
import * as Yup from 'yup';
import Users from '../models/Users';
import Roles from '../models/Roles';

class UserController {
  async index(req, res) {
    // Se o usuário estiver tentando fazer uma edição, a rota virá com o parâmentro id preenchido,
    // caso contrário, o usuário estará na página principal listando todos.
    const user_id = req.params.id;

    if (user_id > 0) {
      const users = await Users.findByPk(user_id);
      if (Object.keys(users).length >= 1) {
        const { role_id } = users;
        const roles = await Roles.findByPk(role_id);
        return res.json({
          id: users.id,
          name: users.name,
          email: users.email,
          deleted_at: users.deleted_at,
          deleted_by: users.deleted_by,
          role_id,
          role: roles.name,
        });
      }
    }

    const whereLike = req.query.name ? req.query.name : '';

    const users = await Users.findAll({
      where: {
        name: {
          [Op.like]: `%${whereLike}%`,
        },
      },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'email', 'deleted_at', 'deleted_by'],
      include: [
        {
          model: Roles,
          as: 'role',
          attributes: ['name'],
        },
      ],
    });

    if (Object.keys(users).length >= 1) {
      return res.json(users);
    }

    return res.json({ message: 'There is no user to list' });
  }

  async store(req, res) {
    // código para validação das informações que são passada pelo usuário
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
      role_id: Yup.number().positive().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const userExists = await Users.findOne({
      where: { email: req.body.email },
    });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // desta forma retornamos somente as informações que precisamos para o frontend
    const { name, email, role_id } = await Users.create(req.body);
    const roles = await Roles.findByPk(role_id);
    return res.json({
      name,
      email,
      role_id,
      role_name: roles.name,
    });
  }

  async update(req, res) {
    // Verifica se o id do usuário passado exite na base de dados
    const user_id = req.params.id;
    const users = await Users.findByPk(user_id);

    if (!users) {
      return res.status(400).json({ error: 'There is no user with this id' });
    }
    // verifico se o usuário deseja alterar ou deletar um registro
    // action = edit -> procedimento de edição do usuário
    // action = delete -> procedimento de remoção do usuário
    // base_url/users/<id>?action=<edit ou delete>
    const action = req.query.action ? req.query.action : 'default';
    switch (action) {
      case 'edit':
        // Verifico se o usuário é administrador para alterar outros usuários
        // Usuários sem o privilégio de amdinistrador só poderá alterar o seu próprio usuário
        // req.roleId -> id do cargo do usuário retirado do token de autenticação
        // user_id -> id passado para edição
        // req.userId -> id do usuário logado na aplicação
        if (req.roleId !== 1) {
          if (Number(user_id) !== req.userId) {
            return res.status(401).json({ error: 'Unauthorized user' });
          }
          // somente administradores podem alterar o cargo dos usuários
          if (req.body.role_id) {
            return res.status(401).json({ erro: 'Unauthorized to change' });
          }
        }
        // ninguém é autorizado a mudar o cargo do master de sistema
        if (req.userId === 1 && req.body.role_id) {
          return res
            .status(401)
            .json({ erro: 'You can not change the role for master user' });
        }
        // o administrador não pode alterar o seu próprio cargo,
        // mas poderá altear de outros usuários inclusive administradores
        if (req.roleId === 1 && req.body.role_id) {
          if (req.userId === Number(user_id)) {
            return res
              .status(401)
              .json({ erro: 'You can not change your own role' });
          }
        }
        // código para validação das informações que são passada pelo usuário
        const schema = Yup.object().shape({
          name: Yup.string(),
          email: Yup.string().email(),
          password: Yup.string().min(6),
          confirmPassword: Yup.string().when('password', (password, field) =>
            password ? field.required().oneOf([Yup.ref('password')]) : field
          ),
          role_id: Yup.number().positive(),
        });

        if (!(await schema.isValid(req.body))) {
          return res.status(400).json({ error: 'Validation fails' });
        }

        const { email } = req.body;
        // verifico se o usuário está alterando e email e se ele já existe no banco de dados
        if (email && email !== users.email) {
          const usersExists = await Users.findOne({ where: { email } });

          if (usersExists) {
            return res.status(400).json({ error: 'Email already exists' });
          }
        }
        const { id, name, role_id } = await users.update(req.body);
        const roles = await Roles.findByPk(role_id);
        return res.json({
          id,
          name,
          email,
          role_id,
          role_name: roles.name,
        });

      case 'delete':
        // se o usuário não for administrador não poderá deletar outro usuário
        if (req.roleId !== 1) {
          return res.status(401).json({ error: 'Unauthorized to change' });
        }
        // o administrador não poderá deletar a si mesmo
        if (req.userId === Number(user_id)) {
          return res.status(401).json({ error: 'Unauthorized to change' });
        }
        await users.update({
          deleted_at: Date.now(),
          deleted_by: req.userId,
        });
        return res.status(200).json({ message: 'user deleted' });

      default:
        return res.status(400).json({ error: 'Bad request' });
    }
  }
}
export default new UserController();
