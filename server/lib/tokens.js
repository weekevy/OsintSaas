import db from '@/database/config';

/**
 * Deducts tokens from a user's account atomically.
 * @param {number} userId - The ID of the user.
 * @param {number} amount - The number of tokens to deduct.
 * @param {object} existingConnection - Optional existing database connection to use.
 * @returns {Promise<boolean>} - True if deduction was successful.
 */
export async function deductCredits(userId, amount = 1, existingConnection = null) {
  const connection = existingConnection || await db.getConnection();
  const shouldRelease = !existingConnection;
  
  try {
    // Only start a new transaction if we're not using an existing connection
    if (!existingConnection) {
      await connection.beginTransaction();
    }

    // Check balance first
    const [rows] = await connection.execute(
      'SELECT credits FROM users WHERE id = ? FOR UPDATE',
      [userId]
    );

    if (rows.length === 0 || rows[0].credits < amount) {
      if (!existingConnection) await connection.rollback();
      return false;
    }

    // Deduct credits
    await connection.execute(
      'UPDATE users SET credits = credits - ? WHERE id = ?',
      [amount, userId]
    );

    if (!existingConnection) {
      await connection.commit();
    }
    
    return true;
  } catch (error) {
    if (!existingConnection) {
      await connection.rollback();
    }
    console.error('Deduct credits error:', error);
    return false;
  } finally {
    if (shouldRelease) {
      connection.release();
    }
  }
}

/**
 * Refunds tokens to a user's account.
 * @param {number} userId - The ID of the user.
 * @param {number} amount - The number of tokens to refund.
 */
export async function refundCredits(userId, amount = 1) {
  try {
    await db.execute(
      'UPDATE users SET credits = credits + ? WHERE id = ?',
      [amount, userId]
    );
    return true;
  } catch (error) {
    console.error('Refund credits error:', error);
    return false;
  }
}
