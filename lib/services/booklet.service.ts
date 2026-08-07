import { BaseService } from "./base.service";

class BookletService extends BaseService {

  async list() {
    throw new Error("Not implemented");
  }

  async get(id: string) {
    throw new Error("Not implemented");
  }

  async create(
    body: any,
    user: any
  ) {
    throw new Error("Not implemented");
  }

  async update(
    id: string,
    body: any,
    user: any
  ) {
    throw new Error("Not implemented");
  }

  async archive(
    id: string,
    user: any
  ) {
    throw new Error("Not implemented");
  }

  async history(id: string) {
    throw new Error("Not implemented");
  }

}

export const bookletService =
  new BookletService();