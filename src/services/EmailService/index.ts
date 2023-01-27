import * as dotenv from 'dotenv'
dotenv.config()

export class EmailService {
  public static sanitizeEmail(email: string): string {
    email = email.toLowerCase()
    const duplicateIndex = email.indexOf('+')
    if (duplicateIndex) {
      const duplicateIndexEnd = email.indexOf('@')
      const duplicateText = email.slice(duplicateIndex, duplicateIndexEnd)
      email = email.replace(duplicateText, '')
    }
    return email
  }
}
