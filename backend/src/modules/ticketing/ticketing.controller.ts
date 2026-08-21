import { Router, Request, Response } from 'express';
import { query } from '../../database/db';
import { authenticateToken, requireRole, AuthRequest } from '../auth/auth.middleware';
import QRCode from 'qrcode';
import crypto from 'crypto';

const router = Router();

// LISTE DE TOUTES LES SALLES ET ESPACES DU CONGO (Brazzaville & Pointe-Noire)
export const CONGO_VENUES = [
  // BRAZZAVILLE
  {
    id: "palais-congres-grande",
    name: "Palais des Congrès - Grande Salle des Congrès",
    city: "Brazzaville",
    address: "Boulevard Denis Sassou Nguesso, Plateau des 15 Ans",
    capacity: 1800,
    type: "Salle de Spectacle & Congrès",
    facilities: "Scène pro, acoustique renforcée, loges VIP, régie lumière"
  },
  {
    id: "palais-congres-banquets",
    name: "Palais des Congrès - Salle des Banquets / Showcases",
    city: "Brazzaville",
    address: "Boulevard Denis Sassou Nguesso",
    capacity: 500,
    type: "Dîner-Concert & Showcase VIP",
    facilities: "Espace cocktail, tables rondes, sono live"
  },
  {
    id: "ifc-brazza-savorgnan",
    name: "Institut Français du Congo (IFC) - Salle Savorgnan de Brazza",
    city: "Brazzaville",
    address: "Rond-Point CCF, Centre-Ville",
    capacity: 480,
    type: "Théâtre & Concert Acoustique",
    facilities: "Insonorisation studio, projection vidéo, éclairage scénique DMX"
  },
  {
    id: "ifc-brazza-exterieur",
    name: "Institut Français du Congo (IFC) - Scène Plein Air",
    city: "Brazzaville",
    address: "Rond-Point CCF, Centre-Ville",
    capacity: 1000,
    type: "Festival & Scène Extérieure",
    facilities: "Grand podium, fosse debout, espace buvette"
  },
  {
    id: "stade-massamba-debat",
    name: "Stade Alphonse Massamba-Débat",
    city: "Brazzaville",
    address: "Bacongo, Brazzaville",
    capacity: 33000,
    type: "Méga-Concert / Festival National",
    facilities: "Pelouse géante, gradins, sonorisation de grande puissance"
  },
  {
    id: "stade-kintele",
    name: "Complexe Sportif de la Concorde (Stade de Kintélé)",
    city: "Brazzaville (Kintélé)",
    address: "Route Nationale 2, Kintélé",
    capacity: 60000,
    type: "Stade International & Festival",
    facilities: "Infrastructures modernes, parkings sécurisés"
  },
  {
    id: "radisson-blu-mbamou",
    name: "Radisson Blu M'Bamou Palace - Salons VIP",
    city: "Brazzaville",
    address: "Bords du Fleuve Congo, Centre-Ville",
    capacity: 300,
    type: "Showcase Ultra-VIP & Soirée SAPE",
    facilities: "Service hôtelier 5 étoiles, sonorisation feutrée"
  },
  {
    id: "centre-culturel-zola",
    name: "Centre Culturel Zola (CCZ)",
    city: "Brazzaville (Bacongo)",
    address: "Bacongo, Rue Mâ-Loango",
    capacity: 350,
    type: "Concert Rumba & Théâtre",
    facilities: "Ambiance intimiste, scène tradi-moderne"
  },

  // POINTE-NOIRE
  {
    id: "ifc-pnr-tchicaya",
    name: "Institut Français de Pointe-Noire - Salle Jean-Baptiste Tchicaya U Tam'si",
    city: "Pointe-Noire",
    address: "Boulevard du Général de Gaulle, Centre-Ville",
    capacity: 350,
    type: "Concert Live & Spectacle",
    facilities: "Scène équipée, acoustique traitée"
  },
  {
    id: "espace-yaro-pnr",
    name: "Espace Culturel Yaro (Côte Sauvage)",
    city: "Pointe-Noire",
    address: "Loandjili / Bords de Mer",
    capacity: 400,
    type: "Festival & Scène Indépendante",
    facilities: "Cadre culturel côtier, scène ouverte"
  },
  {
    id: "stade-municipal-pnr",
    name: "Stade Municipal de Pointe-Noire",
    city: "Pointe-Noire",
    address: "Centre-Ville, Pointe-Noire",
    capacity: 13500,
    type: "Grand Concert Extérieur",
    facilities: "Gradins couverts, espace scène centrale"
  }
];

// OBTENIR LE RÉPERTOIRE DES SALLES DU CONGO
router.get('/venues', (req: Request, res: Response) => {
  return res.json({ venues: CONGO_VENUES });
});

// LISTE DE TOUS LES ÉVÉNEMENTS DISPONIBLES (Public)
router.get('/events', async (req: Request, res: Response) => {
  try {
    const result = await query(`
      SELECT e.*, u.full_name as organizer_name, u.artist_name as organizer_brand
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      WHERE e.is_published = true AND e.event_date >= CURRENT_DATE - INTERVAL '1 day'
      ORDER BY e.event_date ASC
    `);

    return res.json({ events: result.rows });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erreur lors du chargement des événements', details: error.message });
  }
});

// DÉTAILS D'UN ÉVÉNEMENT AVEC COLLABORATEURS ET GUESTS
router.get('/events/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await query(`
      SELECT e.*, u.full_name as organizer_name, u.artist_name as organizer_brand, u.phone_number as organizer_phone,
        (SELECT json_agg(c.*) FROM event_collaborators c WHERE c.event_id = e.id) as collaborators
      FROM events e
      JOIN users u ON e.organizer_id = u.id
      WHERE e.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }

    return res.json({ event: result.rows[0] });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erreur lors du chargement de l\'événement' });
  }
});

// CRÉATION D'UN ÉVÉNEMENT & COLLABORATION (Artiste Musicien OU Organisateur/Promoteur)
router.post('/events/create', authenticateToken, requireRole(['artist', 'organizer']), async (req: AuthRequest, res: Response) => {
  try {
    const creatorId = req.user?.id;
    const {
      title,
      description,
      category,
      event_type,
      venue_name,
      city,
      address,
      event_date,
      banner_image_url,
      ticket_price_fcfa,
      vip_ticket_price_fcfa,
      total_capacity,
      invited_guests,
      revenue_splits
    } = req.body;

    if (!title || !venue_name || !event_date || !ticket_price_fcfa || !total_capacity) {
      return res.status(400).json({ error: 'Veuillez renseigner tous les champs requis (Titre, Lieu, Date, Prix, Capacité).' });
    }

    // 1. Insertion de l'événement
    const result = await query(`
      INSERT INTO events (
        organizer_id, title, description, category, event_type, venue_name, city, address,
        event_date, banner_image_url, ticket_price_fcfa, vip_ticket_price_fcfa, total_capacity,
        invited_guests, revenue_splits
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *
    `, [
      creatorId,
      title,
      description || '',
      category || 'Concert',
      event_type || 'Concert Live Rumba',
      venue_name,
      city || 'Brazzaville',
      address || '',
      event_date,
      banner_image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80',
      ticket_price_fcfa,
      vip_ticket_price_fcfa || null,
      total_capacity,
      JSON.stringify(invited_guests || []),
      JSON.stringify(revenue_splits || [])
    ]);

    const createdEvent = result.rows[0];

    // 2. Enregistrement des collaborateurs et % de partages (Revenue Splits)
    if (revenue_splits && Array.isArray(revenue_splits)) {
      for (const split of revenue_splits) {
        if (split.name && split.split_percentage) {
          await query(`
            INSERT INTO event_collaborators (event_id, name, role, phone_number, split_percentage)
            VALUES ($1, $2, $3, $4, $5)
          `, [
            createdEvent.id,
            split.name,
            split.role || 'Collaborateur',
            split.phone_number || '+242060000000',
            parseFloat(split.split_percentage)
          ]);
        }
      }
    }

    return res.status(201).json({
      message: 'Événement et contrat de partage des revenus créés avec succès !',
      event: createdEvent
    });
  } catch (error: any) {
    console.error('Erreur création événement :', error);
    return res.status(500).json({ error: 'Erreur lors de la création de l\'événement', details: error.message });
  }
});

// ACHAT D'UN BILLET (Public / Mobile Money)
router.post('/buy-ticket', async (req: Request, res: Response) => {
  try {
    const { event_id, buyer_name, buyer_phone, ticket_type, payment_method } = req.body;

    if (!event_id || !buyer_name || !buyer_phone) {
      return res.status(400).json({ error: 'Nom, numéro de téléphone et événement sont obligatoires.' });
    }

    const eventRes = await query('SELECT * FROM events WHERE id = $1', [event_id]);
    if (eventRes.rows.length === 0) {
      return res.status(404).json({ error: 'Événement non trouvé' });
    }
    const event = eventRes.rows[0];

    if (event.tickets_sold >= event.total_capacity) {
      return res.status(400).json({ error: 'Complet ! Tous les billets ont été vendus.' });
    }

    const isVip = ticket_type === 'VIP' && event.vip_ticket_price_fcfa;
    const price = isVip ? event.vip_ticket_price_fcfa : event.ticket_price_fcfa;

    const uniqueSalt = crypto.randomBytes(16).toString('hex');
    const qrCodeHash = `TKT-CG-${Date.now().toString(36).toUpperCase()}-${uniqueSalt.slice(0, 8).toUpperCase()}`;

    const qrPayload = JSON.stringify({
      t: qrCodeHash,
      e: event.id,
      b: buyer_phone,
      n: buyer_name
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'H',
      margin: 2,
      color: { dark: '#1e1b4b', light: '#ffffff' }
    });

    const ticketRes = await query(`
      INSERT INTO tickets (event_id, buyer_name, buyer_phone, ticket_type, price_paid_fcfa, qr_code_hash, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'VALID')
      RETURNING *
    `, [event.id, buyer_name, buyer_phone, isVip ? 'VIP' : 'STANDARD', price, qrCodeHash]);

    await query('UPDATE events SET tickets_sold = tickets_sold + 1 WHERE id = $1', [event.id]);

    return res.status(201).json({
      message: 'Billet acheté avec succès !',
      ticket: {
        ...ticketRes.rows[0],
        event_title: event.title,
        venue: event.venue_name,
        date: event.event_date,
        qr_code_image: qrCodeDataUrl
      },
      instructions: `Un SMS / message WhatsApp contenant ce billet QR Code a été généré pour le ${buyer_phone}.`
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erreur lors de l\'achat du billet', details: error.message });
  }
});

// SCANNER ANTI-FRAUDE DU BILLET À L'ENTRÉE (Organisateur ou Admin uniquement)
router.post('/scan-ticket', authenticateToken, requireRole(['organizer']), async (req: AuthRequest, res: Response) => {
  try {
    const { qr_code_hash } = req.body;
    const scannerUserId = req.user?.id;

    if (!qr_code_hash) {
      return res.status(400).json({ error: 'Code du billet manquant' });
    }

    const ticketRes = await query(`
      SELECT t.*, e.title as event_title, e.venue_name, e.event_date
      FROM tickets t
      JOIN events e ON t.event_id = e.id
      WHERE t.qr_code_hash = $1
    `, [qr_code_hash]);

    if (ticketRes.rows.length === 0) {
      return res.status(404).json({ valid: false, error: 'BILLET INVALIDE / FAUX (Non trouvé dans le système)' });
    }

    const ticket = ticketRes.rows[0];

    if (ticket.status === 'USED') {
      return res.status(400).json({
        valid: false,
        warning: '⚠️ ATTENTION : Billet DÉJÀ UTILISÉ !',
        scanned_at: ticket.scanned_at,
        ticket
      });
    }

    const updateRes = await query(`
      UPDATE tickets
      SET status = 'USED', scanned_at = CURRENT_TIMESTAMP, scanned_by = $1
      WHERE id = $2
      RETURNING *
    `, [scannerUserId || null, ticket.id]);

    return res.json({
      valid: true,
      message: '✅ ENTRÉE AUTORISÉE ! Billet validé avec succès.',
      ticket: { ...updateRes.rows[0], event_title: ticket.event_title, venue_name: ticket.venue_name }
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erreur lors du scan du billet' });
  }
});

export default router;
