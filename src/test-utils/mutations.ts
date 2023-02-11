export const Mutations = {
  REGISTER_TEACHER: `mutation teacherRegister($name: String!, $email: String!, $password: String!) {
    teacherRegister(
      name: $name, 
      email: $email, 
      password: $password
    ) {
      id
      userName
      email
      token
    }
  }`,
  LOGIN_TEACHER: `mutation teacherLogin($name: String, $password: String){
    login(name: $name, password: $password){
      id
      email
      token
    }
  }`,
  REGISTER_STUDENT: `mutation studentRegister($name: String!, $email: String!, $password: String!) {
    studentRegister(
      name: $name, 
      email: $email, 
      password: $password
    ) {
      id
      userName
      email
      token
    }
  }`,
  LOGIN_STUDENT: `mutation studentLogin($name: String, $password: String){
    studentLogin(name: $name, password: $password){
      id
      email
      token
    }
  }`,
}
