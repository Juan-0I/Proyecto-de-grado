const REPAIR_STATUSES = [
  {
    value: 'RECIBIDO',
    label: 'Recibido',
    short: 'Recibido',
    step: 1,
    className: 'bg-secondary-container text-on-secondary-container'
  },
  {
    value: 'EN_REVISION',
    label: 'En revisión',
    short: 'Revisión',
    step: 2,
    className: 'bg-[#fef3c7] text-[#92400e]'
  },
  {
    value: 'EN_REPARACION',
    label: 'En reparación',
    short: 'Reparación',
    step: 3,
    className: 'bg-[#dbeafe] text-[#1e40af]'
  },
  {
    value: 'LISTO',
    label: 'Listo para entrega',
    short: 'Listo',
    step: 4,
    className: 'bg-primary-container text-on-primary-container'
  },
  {
    value: 'ENTREGADO',
    label: 'Entregado',
    short: 'Entregado',
    step: 5,
    className: 'bg-[#dcfce7] text-[#166534]'
  },
  {
    value: 'CANCELADO',
    label: 'Cancelado',
    short: 'Cancelado',
    step: 0,
    className: 'bg-error-container text-on-error-container'
  }
];

const REPAIR_TIMELINE = REPAIR_STATUSES.filter((status) => status.value !== 'CANCELADO');

const PROBLEMAS = [
  'Pantalla rota',
  'Batería',
  'Carga / puerto USB',
  'Humedad',
  'Software',
  'Otro'
];

const FRANJAS = [
  '8:30 - 11:00',
  '11:00 - 14:00',
  '14:00 - 17:00',
  '17:00 - 19:30'
];

const CATEGORIAS = [
  'Audio',
  'Wearables',
  'Consolas',
  'Almacenamiento',
  'Accesorios',
  'Repuestos'
];

const ESTADOS_PEDIDO = ['PENDIENTE', 'PAGADO', 'ENTREGADO', 'CANCELADO'];

function getStatusInfo(value) {
  return (
    REPAIR_STATUSES.find((status) => status.value === value) || {
      value: value || 'SIN_ESTADO',
      label: value || 'Sin estado',
      short: value || 'Sin estado',
      step: 0,
      className: 'bg-surface-container text-on-surface-variant'
    }
  );
}

function toDate(value) {
  if (!value) return null;

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00-05:00`);
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatCurrency(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '$ 0';

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount);
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return '—';

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'America/Bogota'
  }).format(date);
}

function formatDateTime(value) {
  const date = toDate(value);
  if (!date) return '—';

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Bogota'
  }).format(date);
}

function formatInputDate(value) {
  const date = toDate(value);
  if (!date) return '';

  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Bogota'
  }).format(date);
}

function todayISO() {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'America/Bogota'
  }).format(new Date());
}

function nowISO() {
  return new Date().toISOString();
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

module.exports = {
  REPAIR_STATUSES,
  REPAIR_TIMELINE,
  PROBLEMAS,
  FRANJAS,
  CATEGORIAS,
  ESTADOS_PEDIDO,
  getStatusInfo,
  formatCurrency,
  formatDate,
  formatDateTime,
  formatInputDate,
  todayISO,
  nowISO,
  slugify
};
