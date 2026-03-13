const STEPS = ['Shipping', 'Delivery', 'Payment', 'Review'];

type CheckoutStepperProps = {
  step: number;
};

export default function CheckoutStepper({ step }: CheckoutStepperProps) {
  return (
    <div className="surface-card p-4 md:p-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {STEPS.map((name, idx) => {
          const index = idx + 1;
          const active = index === step;
          const complete = index < step;
          return (
            <div key={name} className="flex items-center gap-2">
              <div
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${complete ? 'bg-success text-white' : active ? 'bg-primary text-white' : 'bg-slate-100 text-text-secondary'}`}
              >
                {index}
              </div>
              <p className={`text-sm ${active ? 'font-semibold text-text-primary' : 'text-text-secondary'}`}>{name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
