export { };

declare global {
  interface IUser {
    avatar: string
    id: string
    username: string
    email: string
    permissions: string[]
    roles: string[]
  }
}
