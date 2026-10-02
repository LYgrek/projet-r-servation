/**
 * Envoi des emails de notification (bonus).
 *
 * - Si un serveur SMTP est configuré (variables `SMTP_*`), les emails sont
 *   réellement envoyés via Nodemailer.
 * - Sinon, ils sont affichés dans la console du serveur : pratique en
 *   développement et lors de la démonstration.
 *
 * Un échec d'envoi n'interrompt jamais l'action de l'utilisateur
 * (la réservation reste valide même si l'email ne part pas).
 */
import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { formatDate, formatDuration, formatTime } from "./dates";

interface MailRecipient {
  email: string;
  prenom: string;
}

interface MailActivity {
  nom: string;
  datetimeDebut: Date;
  duree: number;
}

let transporter: Transporter | null | undefined;

/** Crée le transporteur SMTP une seule fois, ou retourne `null` si non configuré. */
function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  transporter = SMTP_HOST
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT ?? 587),
        secure: Number(SMTP_PORT) === 465,
        auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
      })
    : null;
  return transporter;
}

/** Échappe les caractères HTML des données saisies par les utilisateurs. */
function esc(value: string): string {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Gabarit HTML commun à tous les emails. */
function layout(title: string, body: string): string {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f5f5f4;font-family:Arial,sans-serif;color:#1c1917">
  <div style="max-width:560px;margin:24px auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e7e5e4">
    <div style="background:#047857;color:#fff;padding:20px 28px;font-size:20px;font-weight:bold">🌲 Parc Évasion</div>
    <div style="padding:28px"><h1 style="font-size:20px;margin:0 0 16px">${title}</h1>${body}</div>
    <div style="padding:16px 28px;background:#fafaf9;color:#78716c;font-size:12px">Cet email vous a été envoyé automatiquement, merci de ne pas y répondre.</div>
  </div></body></html>`;
}

/** Bloc récapitulatif d'une activité. */
function activityBlock(activity: MailActivity): string {
  return `<div style="background:#ecfdf5;border-radius:12px;padding:16px;margin:16px 0">
    <strong>${esc(activity.nom)}</strong><br/>
    ${formatDate(activity.datetimeDebut)} à ${formatTime(activity.datetimeDebut)}<br/>
    Durée : ${formatDuration(activity.duree)}
  </div>`;
}

/** Envoie un email (ou l'affiche en console si aucun SMTP n'est configuré). */
async function send(to: string, subject: string, html: string): Promise<void> {
  try {
    const smtp = getTransporter();
    if (!smtp) {
      console.info(`\n📧 [email simulé] À : ${to}\n   Sujet : ${subject}\n`);
      return;
    }
    await smtp.sendMail({ from: process.env.MAIL_FROM ?? "Parc Évasion <no-reply@parc-evasion.fr>", to, subject, html });
  } catch (error) {
    console.error("[mail] Échec de l'envoi :", error);
  }
}

export function sendWelcomeEmail(user: MailRecipient): Promise<void> {
  return send(
    user.email,
    "Bienvenue au Parc Évasion !",
    layout(
      `Bienvenue ${esc(user.prenom)} !`,
      "<p>Votre compte a bien été créé. Vous pouvez dès maintenant réserver vos activités en ligne.</p>",
    ),
  );
}

export function sendReservationConfirmation(user: MailRecipient, activity: MailActivity): Promise<void> {
  return send(
    user.email,
    `Réservation confirmée : ${activity.nom}`,
    layout(
      "Votre réservation est confirmée ✅",
      `<p>Bonjour ${esc(user.prenom)},</p><p>Nous avons le plaisir de vous confirmer votre réservation :</p>${activityBlock(activity)}<p>Merci de vous présenter à l'accueil 15 minutes avant le début de l'activité.</p>`,
    ),
  );
}

export function sendReservationCancellation(user: MailRecipient, activity: MailActivity): Promise<void> {
  return send(
    user.email,
    `Réservation annulée : ${activity.nom}`,
    layout(
      "Votre réservation a été annulée",
      `<p>Bonjour ${esc(user.prenom)},</p><p>Votre réservation pour l'activité suivante a bien été annulée :</p>${activityBlock(activity)}<p>Au plaisir de vous revoir bientôt au parc !</p>`,
    ),
  );
}

export function sendActivityCancelledByPark(user: MailRecipient, activity: MailActivity): Promise<void> {
  return send(
    user.email,
    `Activité annulée : ${activity.nom}`,
    layout(
      "Une activité que vous aviez réservée est annulée",
      `<p>Bonjour ${esc(user.prenom)},</p><p>Nous sommes désolés : l'activité suivante a été supprimée de notre programme et votre réservation est donc annulée.</p>${activityBlock(activity)}<p>N'hésitez pas à découvrir nos autres activités.</p>`,
    ),
  );
}
