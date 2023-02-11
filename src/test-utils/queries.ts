export const Queries = {
  CURRENT_TEACHER: `
    {
      currentTeacher  {
        id
        email
        userName
      }
    }
  `,
  CURRENT_STUDENT: `
  {
    currentStudent  {
      id
      email
      userName
    }
  }
`,
}
