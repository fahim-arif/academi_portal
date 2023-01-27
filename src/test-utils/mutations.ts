export const Mutations = {
  // UserResolver Mutations
  REGISTER_USER: `mutation register($userName: String!, $email: String!, $password: String!) {
    register(
      userName: $userName, 
      email: $email, 
      password: $password
    ) {
      id
      userName
      email
      token
    }
  }`,
  LOGIN: `mutation login($emailOrUsername: String, $password: String, $googleIdToken: String){
    login(emailOrUsername: $emailOrUsername, password: $password, googleIdToken: $googleIdToken){
      id
      email
      token
    }
  }`,
}
