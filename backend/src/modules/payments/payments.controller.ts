import { Router, Request, Response } from 'express';
import { query } from '../../database/db';
import { authenticateToken, AuthRequest } from '../auth/auth.middleware';
import { kibangouPay } from './kibangoupay.service';

const router = Router();

// 1. INITIALISER UN PAIEMENT MOBILE MONEY VIA KIBANGOUPAY (MTN MoMo ou Airtel Money Congo)
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const { user_id, amount_fcfa, phone_number, operator, transaction_type, customer_name, metadata } = req.body;

    if (!amount_fcfa || !phone_number || !operator || !transaction_type) {
      return res.status(400).json({ error: 'Montant, numéro de téléphone (+242...), opérateur (MTN/AIRTEL) et type de transaction sont requis.' });
    }

    const amount = parseFloat(amount_fcfa);
    const idempotencyKey = `dep_moyo_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Appel direct à l'orchestrateur KibangouPay
    const kbpResult = await kibangouPay.createDeposit({
      amount,
      currency: 'XAF',
      countryCode: 'CG',
      paymentMethod: 'MOBILE_MONEY',
      operator: operator.toUpperCase().includes('MTN') ? 'MTN' : 'AIRTEL',
      customerName: customer_name || 'Client Moyo Culture',
      customerMobile: phone_number,
      description: `Moyo Culture - Paiement ${transaction_type} (${amount} FCFA)`,
      idempotencyKey,
      metadata: { user_id, transaction_type, ...(metadata || {}) },
    });

    // Enregistrement de la transaction dans la base locale PostgreSQL
    const txRes = await query(`
      INSERT INTO transactions (
        user_id, transaction_type, amount_fcfa, payment_method, phone_used, external_reference, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      user_id || '00000000-0000-0000-0000-000000000000',
      transaction_type,
      amount,
      operator.toUpperCase().includes('MTN') ? 'MTN_MOMO' : 'AIRTEL_MONEY',
      phone_number,
      kbpResult.transaction_id,
      kbpResult.status || 'SUCCESS',
      JSON.stringify(metadata || {})
    ]);

    return res.json({
      success: true,
      message: kbpResult.message,
      transaction: txRes.rows[0],
      kibangoupay: kbpResult,
      ussd_prompt_simulated: true,
    });
  } catch (error: any) {
    console.error('Erreur initiation paiement KibangouPay :', error);
    return res.status(500).json({ error: 'Erreur lors de l\'initiation du paiement via KibangouPay', details: error.message });
  }
});

// 2. WEBHOOK OFFICIEL DE NOTIFICATION KIBANGOUPAY
router.post('/webhook/kibangoupay', async (req: Request, res: Response) => {
  try {
    const { transactionId, status, amount, metadata } = req.body;

    console.log(`[KibangouPay Webhook] Notification reçue pour transaction ${transactionId} (Statut : ${status})`);

    if (status === 'SUCCESS' || status === 'COMPLETED') {
      await query(`
        UPDATE transactions
        SET status = 'SUCCESS'
        WHERE external_reference = $1
      `, [transactionId]);

      // Si le paiement concerne un crédit de wallet ou une billetterie
      if (metadata && metadata.user_id && metadata.credit_wallet) {
        await query(`
          UPDATE users
          SET wallet_balance_fcfa = wallet_balance_fcfa + $1
          WHERE id = $2
        `, [parseFloat(amount), metadata.user_id]);
      }
    } else if (status === 'FAILED') {
      await query(`
        UPDATE transactions
        SET status = 'FAILED'
        WHERE external_reference = $1
      `, [transactionId]);
    }

    return res.json({ status: 'OK', processed: true });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erreur webhook KibangouPay', details: error.message });
  }
});

export default router;
