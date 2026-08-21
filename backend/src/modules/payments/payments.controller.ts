import { Router, Request, Response } from 'express';
import { query } from '../../database/db';
import { authenticateToken, AuthRequest } from '../auth/auth.middleware';

const router = Router();

// INITIALISER UN PAIEMENT MOBILE MONEY (MTN MoMo ou Airtel Money Congo)
router.post('/initiate', async (req: Request, res: Response) => {
  try {
    const { user_id, amount_fcfa, phone_number, operator, transaction_type, metadata } = req.body;

    if (!amount_fcfa || !phone_number || !operator || !transaction_type) {
      return res.status(400).json({ error: 'Montant, numéro de téléphone (+242...), opérateur (MTN/AIRTEL) et type de transaction sont requis.' });
    }

    // Référence unique de paiement pour CinetPay / MoMo
    const externalRef = `TX-CG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Enregistrement de la transaction en statut PENDING
    const txRes = await query(`
      INSERT INTO transactions (
        user_id, transaction_type, amount_fcfa, payment_method, phone_used, external_reference, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7)
      RETURNING *
    `, [
      user_id || '00000000-0000-0000-0000-000000000000',
      transaction_type,
      amount_fcfa,
      operator.toUpperCase().includes('MTN') ? 'MTN_MOMO' : 'AIRTEL_MONEY',
      phone_number,
      externalRef,
      JSON.stringify(metadata || {})
    ]);

    const tx = txRes.rows[0];

    // Simulation / Appel Passerelle MoMo (CinetPay / Push USSD Prompt sur le téléphone)
    return res.json({
      success: true,
      message: `Demande de débit envoyée sur votre téléphone ${operator} (${phone_number}). Veuillez composer votre code secret Mobile Money pour valider les ${amount_fcfa} FCFA.`,
      transaction: tx,
      ussd_prompt_simulated: true,
      instructions: `Un message USSD s'affiche sur le mobile ${phone_number}. Confirmez avec votre code PIN MoMo/Airtel.`
    });
  } catch (error: any) {
    console.error('Erreur initiation paiement :', error);
    return res.status(500).json({ error: 'Erreur lors de l\'initiation du paiement Mobile Money', details: error.message });
  }
});

// WEBHOOK DE NOTIFICATION CINETPAY / MOBILE MONEY
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const { cpm_trans_id, cpm_result, cpm_trans_date } = req.body;

    if (cpm_result === '00') {
      // Succès du paiement
      await query(`
        UPDATE transactions
        SET status = 'SUCCESS'
        WHERE external_reference = $1
      `, [cpm_trans_id]);
    } else {
      await query(`
        UPDATE transactions
        SET status = 'FAILED'
        WHERE external_reference = $1
      `, [cpm_trans_id]);
    }

    return res.json({ status: 'OK' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erreur webhook' });
  }
});

export default router;
