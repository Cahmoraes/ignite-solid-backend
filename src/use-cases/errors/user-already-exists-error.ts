export class UserAlreadyExists extends Error {
  constructor() {
    super('E-mail Already Exists.')
    this.name = 'UserAlreadyExists'
  }
}
