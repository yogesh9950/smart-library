const classes = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-rose-100 text-rose-700',
  returned: 'bg-slate-200 text-slate-700',
};

const StatusBadge = ({ status }) => (
  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${classes[status] || classes.pending}`}>
    {status}
  </span>
);

export default StatusBadge;
