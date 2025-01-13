import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { AppRole } from "../types";

const isAuthenticated = (roles: AppRole[] = []) => {
  const userRepository = AppDataSource.getRepository(User);

  return async ({ headers, jwt }: any) => {
    const authorization = headers?.authorization;
    if (!authorization) {
      throw new Error("Authorization header not found");
    }

    const token = authorization.split(" ")[1];
    if (!token) {
      throw new Error("Token not found");
    }

    let user: User;
    try {
      user = await jwt.verify(token);
    } catch (error) {
      throw new Error("Token is invalid");
    }

    const userInDb = await userRepository.findOneBy({ id: user.id });
    if (!userInDb) {
      throw new Error("User not found");
    }

    if (userInDb.role === AppRole.ADMIN || roles.includes(userInDb.role)) {
      return { user: userInDb };
    }

    if (roles.length && !roles.includes(userInDb.role)) {
      throw new Error("User doesn't have permission");
    }

    return { user: userInDb };
  };
};

export default isAuthenticated;
