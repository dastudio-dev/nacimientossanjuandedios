// Proyecto `nacimientossanjuandedios`: endpoint de SOLO LECTURA para que "Documentos Clínicos" traiga los datos de un nacimiento.
// Lo llama únicamente el servidor de Documentos Clínicos, con un token compartido (secreto INTEGRACION_TOKEN). Devuelve una lista
// blanca de campos (sin notas, evolución ni datos de auditoría) y solo de nacimientos recientes.
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onRequest } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { timingSafeEqual, createHash } from 'node:crypto';

initializeApp();
const INTEGRACION_TOKEN = defineSecret('INTEGRACION_TOKEN');
const DIAS_MAX = 90;
const CAMPOS = ['apellido', 'nombre', 'fecha_nacimiento', 'hora_nacimiento', 'edad_materna', 'g', 'p', 'c', 'a', 'peso', 'talla', 'pc', 'eg',
  'apgar1', 'apgar5', 'tipo_nacimiento', 'presentacion', 'requirio_rcp', 'antPatologicos', 'diagnostico'];
const norm = s => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const hash = s => createHash('sha256').update(s).digest();

export const buscarNacimiento = onRequest({ region: 'southamerica-east1', secrets: [INTEGRACION_TOKEN], maxInstances: 5, cors: false }, async (req, res) => {
  if (req.method !== 'POST') return void res.status(405).json({ error: 'método' });
  const dado = /^Bearer (.+)$/.exec(req.get('authorization') || '')?.[1] || '';
  if (!timingSafeEqual(hash(dado), hash(INTEGRACION_TOKEN.value()))) return void res.status(401).json({ error: 'no autorizado' });
  const apellido = norm(req.body?.apellido); // opcional: sin apellido devuelve los nacimientos más recientes
  if (apellido && apellido.length < 2) return void res.status(400).json({ error: 'apellido' });
  const desde = new Date(Date.now() - DIAS_MAX * 86400000).toISOString().slice(0, 10);
  const snap = await getFirestore().collection('pacientes').where('fecha_nacimiento', '>=', desde).orderBy('fecha_nacimiento', 'desc').limit(300).get();
  const pacientes = snap.docs.filter(d => norm(d.data().apellido).startsWith(apellido))
    .map(d => ({ id: d.id, ...Object.fromEntries(CAMPOS.map(k => [k, d.data()[k] ?? null])) }))
    .sort((a, b) => `${b.fecha_nacimiento} ${b.hora_nacimiento}`.localeCompare(`${a.fecha_nacimiento} ${a.hora_nacimiento}`)).slice(0, 10);
  res.json({ pacientes });
});
