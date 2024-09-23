import type { Pool, RowDataPacket } from 'mysql2/promise'

class UserRepository {
  constructor(private db: Pool) {}

  async getUserById(
    id: number,
  ): Promise<{ id: number; fullname: string; email: string }> {
    const [rows] = await this.db.query<RowDataPacket[]>(
      'SELECT id, fullname, email FROM users WHERE id = ?',
      [id],
    )

    if (!rows.length) {
      throw new Error('user not found')
    }

    return {
      id: rows[0]?.id,
      fullname: rows[0]?.fullname,
      email: rows[0]?.email,
    }
  }
}

export default UserRepository
