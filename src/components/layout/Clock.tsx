import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []);

  return (
    <div className="font-mono text-sm text-foreground hidden md:flex items-center gap-2">
      <span>{format(time, "dd/MM/yyyy", { locale: ptBR })}</span>
      <span className="text-muted-foreground">|</span>
      <span>{format(time, "HH:mm:ss")}</span>
    </div>
  );
}
