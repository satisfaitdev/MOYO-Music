import { Router, Response } from 'express';
import { query } from '../../database/db';
import { authenticateToken, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// OBTENIR LE SOLDE ET L'HISTORIQUE DU WALLET
router.get('/summary', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    // 1. Solde actuel
    const userRes = await query('SELECT wallet_balance_fcfa, momo_number, airtel_number FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur introuvable' });
    }

    // 2. Historique des transactions
    const txRes = await query(`
      SELECT * FROM transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 20
    `, [userId]);

    return res.json({
      balance_fcfa: userRes.rows[0].wallet_balance_fcfa,
      momo_number: userRes.rows[0].momo_number,
      airtel_number: userRes.rows[0].airtel_number,
      recent_transactions: txRes.rows
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erreur lors de la récupération du portefeuille' });
  }
});

// DEMANDE DE RETRAIT VERS COMPTE MOBILE MONEY (PAYOUT MTN / AIRTEL VIA KIBANGOUPAY)
router.post('/withdraw', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { amount_fcfa, phone_number, operator } = req.body;

    const amount = parseFloat(amount_fcfa);
    if (!amount || amount < 2000) {
      return res.status(400).json({ error: 'Le montant minimum de retrait est de 2 000 FCFA.' });
    }

    // 1. Vérifier le solde de l'utilisateur
    const userRes = await query('SELECT full_name, artist_name, wallet_balance_fcfa FROM users WHERE id = $1', [userId]);
    const user = userRes.rows[0];
    const currentBalance = parseFloat(user?.wallet_balance_fcfa || '0');

    if (currentBalance < amount) {
      return res.status(400).json({ error: `Solde insuffisant. Vous avez actuellement ${currentBalance} FCFA.` });
    }

    const beneficiary = user.artist_name || user.full_name || 'Artiste Moyo Culture';
    const idempotencyKey = `wd_moyo_${Date.now()}`;

    // 2. Déclencher le Payout Mobile Money réel via KibangouPay
    const { kibangouPay } = await import('../payments/kibangoupay.service');
    const kbpWithdrawal = await kibangouPay.createWithdrawal({
      amount,
      currency: 'XAF',
      countryCode: 'CG',
      paymentMethod: 'MOBILE_MONEY',
      operator: operator.toUpperCase().includes('MTN') ? 'MTN' : 'AIRTEL',
      beneficiaryName: beneficiary,
      mobileNo: phone_number,
      remarks: `Retrait Royalties Moyo Culture (${amount} FCFA)`,
      idempotencyKey,
      metadata: { user_id: userId }
    });

    // 3. Déduire du solde de l'artiste dans la base locale
    await query('UPDATE users SET wallet_balance_fcfa = wallet_balance_fcfa - $1 WHERE id = $2', [amount, userId]);

    // 4. Enregistrer la transaction de retrait
    const txRes = await query(`
      INSERT INTO transactions (
        user_id, transaction_type, amount_fcfa, payment_method, phone_used, external_reference, status
      ) VALUES ($1, 'payout_withdrawal', $2, $3, $4, $5, 'SUCCESS')
      RETURNING *
    `, [
      userId,
      amount,
      operator.toUpperCase().includes('MTN') ? 'MTN_MOMO' : 'AIRTEL_MONEY',
      phone_number,
      kbpWithdrawal.transaction_id
    ]);

    return res.json({
      message: kbpWithdrawal.message || `Retrait de ${amount} FCFA validé avec succès ! Les fonds ont été envoyés vers votre compte ${operator} (${phone_number}).`,
      transaction: txRes.rows[0],
      kibangoupay: kbpWithdrawal,
      new_balance_fcfa: currentBalance - amount
    });
  } catch (error: any) {
    console.error('Erreur retrait KibangouPay :', error);
    return res.status(500).json({ error: 'Erreur lors du traitement du retrait', details: error.message });
  }
});

export default router;
