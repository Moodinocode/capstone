import supabase from '../config/supabase.js';
import logger from './logger.js';

/**
 * Append a tamper-evident-ish action record. Every privileged write goes
 * through this. Failures are logged but never block the user-facing request.
 *
 * @param {object} entry
 * @param {string} entry.actorType  'judge' | 'system' | 'public'
 * @param {string=} entry.actorId
 * @param {string} entry.action     e.g. 'grade.submit', 'session.set_public'
 * @param {string=} entry.targetType
 * @param {string=} entry.targetId
 * @param {object=} entry.metadata
 * @param {string=} entry.ip
 */
export async function audit(entry) {
  try {
    const row = {
      actor_type: entry.actorType,
      actor_id:   entry.actorId ?? null,
      action:     entry.action,
      target_type: entry.targetType ?? null,
      target_id:   entry.targetId ?? null,
      metadata:    entry.metadata ?? {},
      ip:          entry.ip ?? null,
    };
    const { error } = await supabase.from('audit_logs').insert(row);
    if (error) logger.warn({ err: error.message, action: entry.action }, 'audit insert failed');
  } catch (e) {
    logger.warn({ err: e.message, action: entry.action }, 'audit threw');
  }
}
